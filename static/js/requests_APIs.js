class Requester {
  constructor(){
    this.message = "Ready.";
    this.timeout = window.setTimeout(0);
  }

  update_state(message){
    if (location.protocol == 'https:'){
      var https_warn = "Loading the site over HTTPS may cause API errors."
      if (this.message != https_warn){
        this.message = https_warn;
        $('.notifyjs-wrapper').trigger('notify-hide')
        $.notify(this.message,
                { className: 'error', globalPosition: 'top center', autoHide: false})
      }
    }
    else {
      if (this.message != message){
        // do we have a different message? change it!
        // will toggle modal to show here
        this.message = message;
        clearTimeout(this.timeout)
        if (this.message != "Ready.") {
          $.notify(this.message,
            { className: 'info', globalPosition: 'top center', autoHide: false})
          console.log(this.message)
        }
        else if (this.message == "Ready.") {
          var notif_delay = 3000;
          hide_current_notifications(notif_delay);
          this.timeout = window.setTimeout(() => {
            hide_current_notifications(0)
            $.notify(this.message,
                    { className: 'success', globalPosition: 'top center' });
          }, notif_delay)
          console.log(this.message)
        }
      }
    }
  }

  grabJSON (url, dtype='json') {
    var ajax_params = {
      "url": url,
      "dataType": dtype,
    }
    ajax_params["beforeSend"] = () => (this.update_state("Getting JSON."))
    ajax_params["complete"] = () => (this.update_state("Ready."))
    return $.ajax(ajax_params);
  }

  make_request (ajax_params, message) {
    var ajax_params = ajax_params;
    ajax_params["beforeSend"] = () => (this.update_state(message))
    ajax_params["complete"] = () => (this.update_state("Ready."))
    return $.ajax(ajax_params);
  }

  txtProcess(txt, parser, reach_offline=true) {
    var input_txt = {'text':txt};
    input_txt["offline"] = reach_offline;
    var ajax_params = {
      "url": indra_server_addr + "/"+ parser + "/process_text",
      "type": "POST",
      "dataType": "json",
      "data": JSON.stringify(input_txt),
      "contentType": "application/json",
    };
    var message = ("Processing text.");
    stmts = this.make_request(ajax_params, message)
    return stmts
  }

  groundingMapper(res) {
    var ajax_params = {
      "url": indra_server_addr + "/preassembly/map_grounding",
      "type": "POST",
      "dataType": "json",
      "data": JSON.stringify(res),
      "contentType": "application/json",
    };
    var message = ("Grounding INDRA statements.");
    stmts = this.make_request(ajax_params, message)
    return stmts
  }

  getEvidence(res) {
    var ajax_params = {
      "url": indra_server_addr + "/indra_db_rest/get_evidence",
      "type": "POST",
      "dataType": "json",
      "data": JSON.stringify(res),
      "contentType": "application/json",
      }
    var message = ("Querying INDRA DB for statement evidence.");
    var stmts_db = this.make_request(ajax_params, message)
    return stmts_db
  }

  assembleCyJS(res) {
    var res_json = res;
    var ajax_params = {
      "url": indra_server_addr + "/assemblers/cyjs",
      "type": "POST",
      "dataType": "json",
      "data": JSON.stringify(res_json),
      "contentType": "application/json",
    }
    var message = ("Assembling CytoscapeJS model.");
    var cyjs_model = this.make_request(ajax_params, message)
    return cyjs_model
  }

  assembleEnglish(res) {
    var res_json = res;
    var ajax_params = {
      "url": indra_server_addr + "/assemblers/english",
      "type": "POST",
      "dataType": "json",
      "data": JSON.stringify(res_json),
      "contentType": "application/json",
    }
    var message = ("Assembling English language sentences for each statement.");
    var sentences = this.make_request(ajax_params, message)
    return sentences
  }

  assembleCX(res) {
    var res_json = res;
    var ajax_params = {
      "url": indra_server_addr + "/assemblers/cx",
      "type": "POST",
      "dataType": "json",
      "data": JSON.stringify(res_json),
      "contentType": "application/json",
    }
    var message = ("Assembling Cytoscape CX model.");
    var cx_model = this.make_request(ajax_params, message)
    return cx_model
  }

  shareNDEX(model_elements, preset_pos, stmts, sentences, evidence, cell_line,
            mrna, mutations, txt_input, parser) {
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
    var ajax_params = {
      "url": indra_server_addr + "/share_model_ndex",
      "type": "POST",
      "dataType": "json",
      "data": JSON.stringify(res_json),
      "contentType": "application/json",
    }
    var message = ("Uploading model to NDEX.");
    var ndex_push = this.make_request(ajax_params, message)
    return ndex_push;
  }

  getNDEX(network_id) {
    var res_json = {"network_id": network_id};
    var ajax_params = {
      "url": indra_server_addr + "/fetch_model_ndex",
      "type": "POST",
      "dataType": "json",
      "data": JSON.stringify(res_json),
      "contentType": "application/json",
    }
    var message = ("Downloading model from NDEX.");
    var ndex_pull = this.make_request(ajax_params, message)
    return ndex_pull;
  }

  requestPySB(stmts, export_format, message) {
    var res_json = {};
    res_json['statements'] = stmts['statements']
    res_json['export_format'] = export_format;
    var ajax_params = {
      "url": indra_server_addr + "/assemblers/pysb",
      "type": "POST",
      "dataType": "json",
      "data": JSON.stringify(res_json),
      "contentType": "application/json",
    }
    var pysb_model = this.make_request(ajax_params, message)
    return pysb_model
  }

  assemblePySB(res) {
    var message = "Assembling PySB model."
    return this.requestPySB(res, null, message);
  }

  assembleSBML(res) {
    var message = "Assembling SBML model."
    return this.requestPySB(res, 'sbml', message);
  }

  assembleSBGN(res) {
    var message = "Assembling SBGN model."
    return this.requestPySB(res, 'sbgn', message);
  }

  assembleBNGL(res) {
    var message = "Assembling BNGL model."
    return this.requestPySB(res, 'bngl', message);
  }

  assembleKappa(res) {
    var message = "Assembling Kappa model."
    return this.requestPySB(res, 'kappa', message);
  }

  assembleKappaIM(res) {
    var message = "Assembling Kappa IM."
    return this.requestPySB(res, 'kappa_im', message);
  }

  get_ccle_mrna(gene_list, cell_line) {
    var input_txt = {'gene_list': gene_list,
                     'cell_lines': [cell_line]};
    var ajax_params = {
      "url": indra_server_addr + "/databases/cbio/get_ccle_mrna",
      "type": "POST",
      "dataType": "json",
      "data": JSON.stringify(input_txt),
      "contentType": "application/json",
     }
     var message = ("Retreiving CCLE mRNA expression.");
     var mrna = this.make_request(ajax_params, message);
     return mrna
  }

  get_ccle_cna(gene_list, cell_line) {
    var input_txt = {'gene_list': gene_list,
                     'cell_lines': [cell_line]};
    var ajax_params = {
      "url": indra_server_addr + "/databases/cbio/get_ccle_cna",
      "type": "POST",
      "dataType": "json",
      "data": JSON.stringify(input_txt),
      "contentType": "application/json",
    }
    var message = ("Getting CCLE CNA.");
    var cna = this.make_request(ajax_params, message);
    return cna
  }

  get_ccle_mutations(gene_list, cell_line) {
    var input_txt = {'gene_list': gene_list,
                     'cell_lines': [cell_line]};
    var ajax_params = {
      "url": indra_server_addr + "/databases/cbio/get_ccle_mutations",
      "type": "POST",
      "dataType": "json",
      "data": JSON.stringify(input_txt),
      "contentType": "application/json",
     }
    var message = ("Getting CCLE mutation status.");
    var mutations = this.make_request(ajax_params, message);
    return mutations
  }
}

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

function assembleLoopy(res) {
  var res_json = res;
  return $.ajax({
      url: indra_server_addr + "/assemblers/sif/loopy",
      type: "POST",
      dataType: "json",
      data: JSON.stringify(res_json),
  });
}

function bind_this (target) {
// taken from https://ponyfoo.com/articles/binding-methods-to-class-instance-objects
  const cache = new WeakMap();
  const handler = {
    get (target, key) {
      const value = Reflect.get(target, key);
      if (typeof value !== 'function') {
        return value;
      }
      if (!cache.has(value)) {
        cache.set(value, value.bind(target));
      }
      return cache.get(value);
    }
  };
  const proxy = new Proxy(target, handler);
  return proxy;
}

function hide_current_notifications(timeout_ms = 0){
  var current_notifs = $('.notifyjs-wrapper')
  window.setTimeout(function(){
    var next_notifs = $('.notifyjs-wrapper')
    var filtered_notifs = current_notifs.filter(next_notifs)
    filtered_notifs.trigger('notify-hide')
  }, timeout_ms)
}
