// retrieve a JSON from a url
//***************************************
function grabJSON (url, dtype='json') {
  return $.ajax({
    url: url,
    dataType: dtype
  });
}
//***************************************

//build bootstrap-select dropdown using json
//***************************************
function dropdownFromJSON (div_id, ajax_response) {
  $.each(ajax_response, function(name, file) {
       $(div_id).append($('<option/>').attr("value", file).text(name));
    });
  $('.selectpicker').selectpicker('refresh');
}
//***************************************

//build bootstrap-select dropdown using json
//***************************************
function dropdownCtxtSelectFromJSON (div_id, ajax_response) {
  $.each(ajax_response, function(name, file) {
       $(div_id).append($('<option/>').attr("value", file).text(file));
    });
}
//***************************************


//download a model
//***************************************
function download(exportName, exportObj){
  if (exportName.includes('.png')){
    encoding_type = "image/png";
    var data = atob( exportObj.substring( "data:image/png;base64,".length ) ),
    asArray = new Uint8Array(data.length);
    for( var i = 0, len = data.length; i < len; ++i ) {
        asArray[i] = data.charCodeAt(i);    
    }
    var blob = new Blob( [ asArray.buffer ], {type: "image/png"} );
  }
  else {
    var blob = new Blob([exportObj], {type: "text/plain;charset=utf-8"});
  }
  saveAs(blob, exportName);
}
//***************************************

//send text to a reading system, get back stmts
//***************************************
function txtProcess(txt, parser) {
  var input_txt = {'text':txt};
  stmts = $.ajax({
    url: indra_server_addr + "/"+ parser + "/process_text",
    type: "POST",
    dataType: "json",
    data: JSON.stringify(input_txt),
    });
  return stmts
}

// send stmts to grounding mapper, get grounded stmts
//***************************************
function groundingMapper(res) {
  stmts = $.ajax({
    url: indra_server_addr + "/preassembly/map_grounding",
    type: "POST",
    dataType: "json",
    data: JSON.stringify(res),
    });
  return stmts
}
//***************************************

// query db for support to single statement
//***************************************
function getEvidence(res) {
  stmts_db = $.ajax({
    url: indra_server_addr + "/indra_db_rest/get_evidence",
    type: "POST",
    dataType: "json",
    data: JSON.stringify(res),
    });
  return stmts_db
}
//***************************************


function assembleCyJS(res) {
  var res_json = res;
  return $.ajax({
      url: indra_server_addr + "/assemblers/cyjs",
      type: "POST",
      dataType: "json",
      data: JSON.stringify(res_json),
  });
}

function assembleEnglish(res) {
  var res_json = res;
  return $.ajax({
      url: indra_server_addr + "/assemblers/english",
      type: "POST",
      dataType: "json",
      data: JSON.stringify(res_json),
  });
}

function requestPySB(res, export_format=null) {
  var res_json = res;
  res_json['line'] = $('#cellSelectDynamic').val().slice(6,-5);
  if (export_format){
    res_json['export_format'] = export_format;
    }
  return $.ajax({
      url: indra_server_addr + "/assemblers/pysb",
      type: "POST",
      dataType: "json",
      data: JSON.stringify(res_json),
  });
}

function assembleCX(res) {
  var res_json = res;
  res_json['cyjs_model'] = JSON.stringify(cy.json())
  return $.ajax({
      url: indra_server_addr + "/assemblers/cx",
      type: "POST",
      dataType: "json",
      data: JSON.stringify(res_json),
  });
}

function shareNDEX(model_elements, preset_pos, stmts, sentences, evidence, cell_line, mrna, mutations, txt_input, parser) {
  var res_json = {};
  res_json['stmts'] = JSON.stringify(stmts);
  res_json['model_elements'] = JSON.stringify(model_elements);
  res_json['preset_pos'] = JSON.stringify(preset_pos);
  res_json['sentences'] = JSON.stringify(sentences);
  res_json['evidence'] = JSON.stringify(evidence);
  res_json['cell_line'] = cell_line;
  res_json['mrna'] = JSON.stringify(mrna);
  res_json['mutations'] = JSON.stringify(mutations);
  res_json['txt_input'] = txt_input;
  res_json['parser'] = parser;
  return $.ajax({
      url: indra_server_addr + "/share_model_ndex",
      type: "POST",
      dataType: "json",
      data: JSON.stringify(res_json),
  });
}


function getNDEX(network_id) {
  var res_json = {"network_id": network_id};
  return $.ajax({
      url: indra_server_addr + "/fetch_model_ndex",
      type: "POST",
      dataType: "json",
      data: JSON.stringify(res_json),
  });
}


function assemblePySB(res) {
  return requestPySB(res);
  }

function assembleSBML(res) {
    return requestPySB(res, 'sbml');
    }

function assembleSBGN(res) {
    return requestPySB(res, 'sbgn');
    }

function assembleBNGL(res) {
    return requestPySB(res, 'bngl');
    }

function assembleKappa(res) {
    return requestPySB(res, 'kappa');
    }



function assembleLoopy(res) {
  var res_json = res;
  return $.ajax({
      url: indra_server_addr + "/assemblers/sif/loopy",
      type: "POST",
      dataType: "json",
      data: JSON.stringify(res_json),
  });
}

function get_ccle_mrna(gene_list, cell_line) {
  var input_txt = {'gene_list': gene_list,
                   'cell_lines': [cell_line]};
  return $.ajax({
            url: indra_server_addr + "/databases/cbio/get_ccle_mrna",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(input_txt),
           })
}

function get_ccle_cna(gene_list, cell_line) {
  var input_txt = {'gene_list': gene_list,
                   'cell_lines': [cell_line]};
  return $.ajax({
            url: indra_server_addr + "/databases/cbio/get_ccle_cna",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(input_txt),
           })
}

function get_ccle_mutations(gene_list, cell_line) {
  var input_txt = {'gene_list': gene_list,
                   'cell_lines': [cell_line]};
  return $.ajax({
            url: indra_server_addr + "/databases/cbio/get_ccle_mutations",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(input_txt),
           })
}
