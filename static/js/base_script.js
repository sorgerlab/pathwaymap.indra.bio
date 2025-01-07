var cy = cytoscape();
let rq = bind_this(new Requester());

// {name : position} dict
var prebuilt_model = 'McCormick';
var preset_pos = {};
var preset_pos_static = {};

// {id : position} dict
var id_pos = {};

var layout_enabled = true;
var scapes = {};
var stmts;
var sentences;
var evidence = {};
var cyjs_elements; //this is set by drawCytoscape with a copy of model_elements
var model_elements;
var mrna;
var mutations;
var cell_line = "LOXIMVI_SKIN";
var txt_input;
var network_id;
var url = new URL(location.href)
network_id = url.searchParams.get("uuid")

var indra_server_addr = "https://api.indra.bio";

var ctxt = {};

var ras_model_promise;
var ras_preset_pos_promise;
var mrna_promise;
var mutations_promise;
var model_components_promise;
var ras_stmts_promise;

var domain = [2.7, 3.7, 4.7, 5.7, 6.7, 7.7, 8.7, 9.7, 10.7];
var exp_colorscale = d3.scaleThreshold()
    .domain(domain)
    .range(['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b']);
var mut_colorscale =  d3.scaleThreshold()
    .domain(domain)
    .range(['#fff5eb','#fee6ce','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#a63603','#7f2704']);

var parser = 'reach';

var select_array;
var sub_select_array;
var unique_col_val;

var ctx_select_divs = ['#drug_select', '#conc_select', '#time_select', '#cell_line_select'];
var current_ctx_selection = new Array(ctx_select_divs.length).fill("");

var paths;
var table_data;
var path_uuids_dict = {};
var table;
var path_id;

$(function(){
  $('body').tooltip({ selector: '[data-toggle="tooltip"]' });
  $('[rel="tooltip"]').tooltip({trigger: "hover"});
  var win = $(window);
  var container_fluid_height = ($('body').height());
  var cy_height = String(container_fluid_height/1.2024);
  $('.cy')[0].setAttribute("style", "height:" + cy_height +  "px;");
  $('.cy-container')[0].setAttribute("style", "height:" + cy_height +  "px;");
  
  if (network_id){
    drawCytoscape('cy_1', {"nodes":[{"data":{"id":0, "name": "A"}}], "edges":[{"data":{"i":"Virtual","id":1,"polarity":"positive","source":0,"target":0,"uuid_list":["404"]}}]} )
    scapes["cy_1"].remove(scapes["cy_1"].nodes())
    drawFromNDEX(network_id, "cy_1");
  }
  else {
    var ras_model_promise = rq.grabJSON('static/models/' + prebuilt_model + '/model.json');
    var ras_preset_pos_promise = rq.grabJSON('static/models/' + prebuilt_model + '/preset_pos.json');
    var mrna_promise = rq.grabJSON('static/models/' + prebuilt_model + '/mrna.json');
    var mutations_promise = rq.grabJSON('static/models/' + prebuilt_model + '/mutations.json');
    var model_components_promise = Promise.all([ras_model_promise, ras_preset_pos_promise, mrna_promise, mutations_promise]);
    var ras_stmts_promise = rq.grabJSON('static/models/' + prebuilt_model + '/stmts.json');
    var ras_stmts_response;
    ras_stmts_promise.then(function(res){
      ras_stmts_response = res;
      stmts = ras_stmts_response;
    })
    var ras_sentences_promise = rq.grabJSON('static/models/' + prebuilt_model + '/sentences.json');
    var ras_sentences_response;
    ras_sentences_promise.then(function(res){
      ras_sentences_response = res;
      sentences = res;
    })
    drawCytoscape('cy_1', {"nodes":[{"data":{"id":0, "name": "A"}}], "edges":[{"data":{"i":"Virtual","id":1,"polarity":"positive","source":0,"target":0,"uuid_list":["404"]}}]} )
    scapes["cy_1"].remove(scapes["cy_1"].nodes())
    model_components_promise.then(function(promises){
      preset_pos = promises[1];
      model_elements = promises[0];
      mrna = promises[2];
      mutations = promises[3];
      drawCytoscape ('cy_1', model_elements);
      modalEdges(scapes['cy_1'], rq);
      clearUploadInfo();
      qtipNodes(scapes['cy_1']);
      scapes['cy_1'].fit();
      var gene_names = get_cy_gene_names(scapes['cy_1']);
      set_context(scapes['cy_1'], gene_names, mrna, mutations);
    })
  }

  // build the dropdown pickers
  rq.grabJSON('static/cell_dict.json').then(
    function(ajax_response){
      var interesting_lines = {"LOXIMVI_SKIN":"model_LOXIMVI_SKIN.json", "A101D_SKIN":"model_A101D_SKIN.json"};
      for (var d of ['#cellSelectStatic', '#cellSelectDynamic']) {
          dropdownFromJSON(d, interesting_lines);
          $(d).append($('<option data-divider="true"/>'));
        }
      for (var d of ['#cellSelectStatic', '#cellSelectDynamic']) {
          dropdownFromJSON(d, ajax_response);
        }
      }
  );


  $("#loadButtonDynamic").click(function(){
    var txt = $('#textArea')[0].value;
    var stmts_promise = rq.txtProcess(txt, parser).then(rq.groundingMapper)
    var cyjs_promise = stmts_promise.then(rq.assembleCyJS);
    var english_promise = stmts_promise.then(rq.assembleEnglish)
    var english_promise;
    stmts_promise.then(function (model_response) {
      stmts = model_response;
    });
    cyjs_promise.then(function (model_response) {
      model_elements = model_response;
      activate_layout();
      drawCytoscape('cy_1', model_response);
      modalEdges(scapes['cy_1'], rq);
      clearUploadInfo();
      reset_url();
      qtipNodes(scapes['cy_1']);
      $('#menu').modal('hide');
      document.getElementById("loadContextButton").click();
    });
    english_promise.then(function (model_response) {
      sentences = model_response;
    })
  });

  $("#loadContextButton").click(function(){
    $('#menu').modal('hide');
    var new_cell_line = $('#cellSelectDynamic').val().slice(6,-5);
    contextualizeNodesCCLE(scapes['cy_1'], new_cell_line, rq)
  });

  $("#downloadPySB").click(function(){
    rq.assemblePySB(stmts).then(function (res) {
      download('model.py', res['model']);
    });
  });

  $("#downloadSBML").click(function(){
    rq.assembleSBML(stmts).then(function (res) {
      download('model.sbml', res['model']);
    });
  });

  $("#downloadSBGN").click(function(){
    rq.assembleSBGN(stmts).then(function (res) {
      download('model.sbgn', res['model']);
    });
  });

  $("#downloadKappa").click(function(){
    rq.assembleKappa(stmts).then(function (res) {
      download('model.ka', res['model']);
    });
  });

  $("#downloadKappaIM").click(function(){
    rq.assembleKappaIM(stmts).then(function (res) {
      download('model_kappa_im.png', res['image']);
    });
  });

  $("#downloadBNGL").click(function(){
    rq.assembleBNGL(stmts).then(function (res) {
      download('model.bngl', res['model']);
    });
  });

  $("#downloadCX").click(function(){
    rq.assembleCX(stmts).then(function (res) {
      download('model.cx', res['model']);
    });
  });

  $("#NDEX_upload_btn").click(function(){
    var modal_body = $('.ndex-upload-container')[0]
    modal_body.innerHTML = null
    var par = document.createElement("p");
    par.textContent = 'Uploading model to NDEX...'
    modal_body.append(par)
    txt_input = $('#textArea')[0].value;
    preset_pos = updatePresetPos(scapes['cy_1'], preset_pos)
    rq.shareNDEX(cyjs_elements, preset_pos, stmts,
                 sentences, evidence, cell_line, mrna,
                 mutations, txt_input, parser).then(function (res) {
      par.textContent = 'Network uploaded to NDEX.'
      var par2 = document.createElement("p");
      network_id = res['network_id']
      var network_address =  "http://ndexbio.org/#/network/" + network_id
      var temp_link = document.createElement("a");
      temp_link.href = network_address;
      temp_link.text = network_address;
      temp_link.target = '_blank';
      par2.append(temp_link);
      modal_body.append(par2);
      // edit url to contain ndex uuid
      var url = new URL(location.href)
      url.searchParams.set('uuid', network_id)
      history.pushState(null, '', url);
    });
  });

  function drawFromNDEX(network_id, scape_id){
    rq.getNDEX(network_id).then(function (res) {
      model_elements = JSON.parse(res.model_elements)
      preset_pos = JSON.parse(res.preset_pos)
      stmts = JSON.parse(res.stmts)
      sentences = JSON.parse(res.sentences)
      evidence = JSON.parse(res.evidence)
      cell_line = res.cell_line
      $('#cellSelectDynamic').selectpicker()[0].value = 'model_' + cell_line + '.json'
      $('#cellSelectDynamic').selectpicker('refresh')
      mrna = JSON.parse(res.mrna)
      mutations = JSON.parse(res.mutations)
      txt_input = res.txt_input;
      $('#textArea').val(txt_input);
      parser = res.parser;
      $("#parseReach")[0].classList.remove('active')
      $("#parseTrips")[0].classList.remove('active')
      if (parser == 'trips'){
        $("#parseTrips").addClass("active");
      }
      else {
        $("#parseReach").addClass("active");
      }
      layout_enabled = false;
      disable_layout()
      drawCytoscape (scape_id, model_elements);
      modalEdges(scapes['cy_1'], rq);
      clearUploadInfo();
      qtipNodes(scapes[scape_id]);
      scapes[scape_id].fit();
      var gene_names = get_cy_gene_names(scapes[scape_id]);
      set_context(scapes[scape_id], gene_names, mrna, mutations);
      $('#ndexModal').modal('hide');
      layout_enabled = true;
      activate_layout()
    });
  }

  $("#loadNDEX").click(function(){
    var network_id = $("#ndexUUID")[0].value
    drawFromNDEX(network_id, "cy_1");
  });


  $("#downloadINDRA").click(function(){
    download('stmts.json', JSON.stringify(stmts['statements'], null, 2));
  });


  $("#downloadPNG").click(function(){
    var png_scale = 20;
    var cypng = scapes['cy_1'].png({scale: png_scale, output:'blob'});
    // console.log(cypng.length)
    while (cypng.length < 7) {
      png_scale -= 1;
      cypng = scapes['cy_1'].png({scale: png_scale, output:'blob'});
    }
    download('model.png', cypng);
  });


  $("#loopy").click(function(){
    var txt = $('#textArea')[0].value;

    rq.txtProcess(txt, parser).then(rq.groundingMapper).then(assembleLoopy).then(function (res) {

        window.open(
          res['loopy_url'].toString(),
          "_blank"
        );
    });
  });

$("#layoutToggle").change(function() {
  layout_enabled = $("#layoutToggle").prop('checked')
});


$("#loadButtonStatic").click(function(){
  model_promise = rq.grabJSON('static/models/' + prebuilt_model + '/model.json');
  preset_pos_promise = rq.grabJSON('static/models/' + prebuilt_model + '/preset_pos.json');
  txt_input_promise = rq.grabJSON('static/models/' + prebuilt_model + '/txt_input.json', dtype='text');
  var model_components_promise = Promise.all([model_promise, preset_pos_promise, txt_input_promise]);
  stmts_promise = rq.grabJSON('static/models/' + prebuilt_model + '/stmts.json');
  sentences_promise = rq.grabJSON('static/models/' + prebuilt_model + '/sentences.json');
  stmts_promise.then(function(res){
    stmts_response = res;
    stmts = stmts_response;
  })
  sentences_promise = rq.grabJSON('static/models/' + prebuilt_model + '/sentences.json');
  sentences_promise.then(function(res){
    sentences_response = res;
    sentences = res;
  })
  model_components_promise.then(function(promises){
    preset_pos = promises[1];
    model_elements = promises[0];
    txt_input = promises[2];
    activate_layout();
    drawCytoscape ('cy_1', model_elements);
    modalEdges(scapes['cy_1'], rq);
    clearUploadInfo();
    qtipNodes(scapes['cy_1']);
    $('#textArea').val(txt_input);
    scapes['cy_1'].fit();
    document.getElementById("loadContextButton").click();
  })
  reset_url();
});

$(".cyjs2loopy").click(function(){
  var model = loopyFromCyJS("cy_1");
  window.open(
    'http://ncase.me/loopy/v1/?data=' + model,
    "_blank"
  );
});

$('a[href="#byom"]').click(function(){
  if (this.classList.contains("active") === false){
    preset_pos = {};
  }
});

$("#parseReach").click(function(){
  if (this.classList.contains("active")){
    $("#parseReach").removeClass("active");
    $("#parseTrips").addClass("active");
    parser='trips';
  }
  else {
    $("#parseReach").addClass("active");
    $("#parseTrips").removeClass("active");
    parser='reach';
  }
});


$("#parseTrips").click(function(){
  if (this.classList.contains("active")){
    $("#parseTrips").removeClass("active");
    $("#parseReach").addClass("active");
    parser='reach';
  }
  else {
    $("#parseTrips").addClass("active");
    $("#parseReach").removeClass("active");
    parser='trips';
  }
});

$('a[href="#ras227"]').click(function(){
  preset_pos = preset_pos_static;
});

// change prebuilt_model name every time the user changes dropdown
$('#model_picker').on('changed.bs.select', function(){
  prebuilt_model = $('#model_picker').selectpicker('val');
});

// change prebuilt_model name every time the user changes dropdown
$('.ctx-select').on('changed.bs.select', function(){
  var div_id = "#" + this.id;
  var val = $(div_id).selectpicker('val');
  current_ctx_selection[ctx_select_divs.indexOf(div_id)] = val;
  sub_select_array = array_multifilter(sub_select_array, current_ctx_selection);
  clearCtxtSelects();
  build_ctx_dropdowns(sub_select_array, ctx_select_divs, current_ctx_selection);
});

$("#reset_filter").click(function(){
  sub_select_array = select_array;
  current_ctx_selection = new Array(ctx_select_divs.length).fill("");
  clearCtxtSelects();
  build_ctx_dropdowns(sub_select_array, ctx_select_divs, current_ctx_selection);
  rq.grabJSON('static/models/' + prebuilt_model + '/model.json').then(function (model_response) {
    model_elements = model_response;
    drawCytoscape ('cy_1', model_response);
    modalEdges(scapes['cy_1'], rq);
    clearUploadInfo();
    qtipNodes(scapes['cy_1']);
  });
});

$("#load_context").click(function(){
  condition = current_ctx_selection.join('_');
  phosphoContextSN(scapes['cy_1'], ctxt, condition);
});

$('#path_table').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            path_id = this.childNodes[5].innerText;
            highlightPath(scapes['cy_1'], path_uuids_dict[path_id]);
        }
    } );


$('.cy').each(function(){
  $('.cy')[0].setAttribute("style", "height: 100%;");
  // document.getElementById("loadButtonStatic").click();
  function resize() {
    $(".cy-container").height(win.innerHeight() - 250);
    $(".cy").height(win.innerHeight() - 250);
    if (scapes['cy_1']){
      scapes['cy_1'].center();
    }
  }
  
  var resizeTimer;
  $(window).on('resize', function(e) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      resize();
    }, 250);
  });
  setTimeout(resize, 0);
});

});// dom ready

function contextualizeNodesCCLE(cy, new_cell_line, requester){
  // check if we cell line selection changed before req to API
  requester.update_state("Setting context to " + new_cell_line + ".");
  gene_names = get_cy_gene_names(cy);
  mrna_promise = rq.get_ccle_mrna(gene_names, new_cell_line)
  mutations_promise = rq.get_ccle_mutations(gene_names, new_cell_line)
  Promise.all([mrna_promise, mutations_promise]).then(function(pp){
    var new_mrna = pp[0]
    var new_mutations = pp[1]
    check_response = (new_mrna.mrna_amounts[new_cell_line] != null)
    if (check_response){
      cell_line = new_cell_line;
      mrna = new_mrna;
      mutations = new_mutations;
    }
    else {
      requester.update_state("Cell line data not found, restoring previous settings.")
      $('#cellSelectDynamic').val("model_" + cell_line + ".json")
      $('#cellSelectDynamic').selectpicker('render')
    }
    set_context(cy, gene_names, mrna, mutations);
    requester.update_state("Ready.")
  })
}

function activate_layout(){
  $("#layoutToggle").bootstrapToggle('on')
}

function disable_layout(){
  $("#layoutToggle").bootstrapToggle('off')
}

function clearUploadInfo(){
  var modal_body = $('.ndex-upload-container')[0]
  modal_body.innerHTML = null
}

function reset_url(){
  var url = new URL(location.href)
  history.pushState(null, '', url.origin);
  network_id = null;
}
