// retrieve a JSON from a url
//***************************************
function grabJSON (url) {
  return $.ajax({
    url: url,
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

function shareNDEX(res) {
  var res_json = res;
  res_json['cyjs_model'] = JSON.stringify(cy.json())
  return $.ajax({
      url: indra_server_addr + "/share_model",
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

var mrna;
function get_ccle_mrna(gene_list, cell_line) {
  var input_txt = {'gene_list': gene_list,
                   'cell_lines': [cell_line]};
  return $.ajax({
            url: indra_server_addr + "/databases/cbio/get_ccle_mrna",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(input_txt),
           }).then(function(res){
                      res = res["mrna_amounts"];
                      res = res[cell_line];
                      mrna = res;
                  });
}

var cna;
function get_ccle_cna(gene_list, cell_line) {
  var input_txt = {'gene_list': gene_list,
                   'cell_lines': [cell_line]};
  return $.ajax({
            url: indra_server_addr + "/databases/cbio/get_ccle_cna",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(input_txt),
           }).then(function(res){
                      res = res["cna"];
                      res = res[cell_line];
                      cna = res;
                  });
}

var mutations;
function get_ccle_mutations(gene_list, cell_line) {
  var input_txt = {'gene_list': gene_list,
                   'cell_lines': [cell_line]};
  return $.ajax({
            url: indra_server_addr + "/databases/cbio/get_ccle_mutations",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(input_txt),
           }).then(function(res){
                      res = res["mutations"];
                      res = res[cell_line];
                      mutations = res;
                  });
}
