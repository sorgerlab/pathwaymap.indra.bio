var cy = cytoscape();

// {name : position} dict
var prebuilt_model = 'McCormick';
var preset_pos = {};
var preset_pos_static = {};

// {id : position} dict
var id_pos = {};

var scapes = {};
var stmts;
var sentences;
var evidence = {};

var indra_server_addr = "http://indra-api-72031e2dfde08e09.elb.us-east-1.amazonaws.com:8000";
//var indra_server_addr = "http://0.0.0.0:8080";

var ctxt = {};

var ras_model_promise = grabJSON('static/models/McCormick/model.json');
var ras_preset_pos_promise = grabJSON('static/models/McCormick/preset_pos.json');
var model_components_promise = Promise.all([ras_model_promise, ras_preset_pos_promise]);
var ras_stmts_promise = grabJSON('static/models/McCormick/stmts.json');
var ras_stmts_response;
ras_stmts_promise.then(function(res){
  ras_stmts_response = res;
  stmts = ras_stmts_response;
})
var ras_sentences_promise = grabJSON('static/models/McCormick/sentences.json');
var ras_sentences_response;
ras_sentences_promise.then(function(res){
  ras_sentences_response = res;
  sentences = res;
})

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

  var win = $(window);
  var container_fluid_height = ($('body').height());
  var cy_height = String(container_fluid_height/1.2024);
  $('.cy')[0].setAttribute("style", "height:" + cy_height +  "px;");
  $('.cy-container')[0].setAttribute("style", "height:" + cy_height +  "px;");

  // build the dropdown pickers
  grabJSON('static/cell_dict.json').then(
    function(ajax_response){
      var interesting_lines = {"A101D_SKIN":"model_A101D_SKIN.json", "LOXIMVI_SKIN":"model_LOXIMVI_SKIN.json"};
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
    
    var stmts_promise = txtProcess(txt, parser).then(groundingMapper);
    var cyjs_promise = stmts_promise.then(assembleCyJS);
    var english_promise = stmts_promise.then(assembleEnglish)
    var english_promise;
    stmts_promise.then(function (model_response) {
      stmts = model_response;
    });
    cyjs_promise.then(function (model_response) {
      drawCytoscape('cy_1', model_response);
      qtipNodes(scapes['cy_1']);
      $('#menu').modal('hide');
    });
    english_promise.then(function (model_response) {
      sentences = model_response;
    })
    
    $('.cyjs2loopy').prop('disabled', false);
  });

  $("#loadContextButton").click(function(){
    var cell_line = $('#cellSelectDynamic').val().slice(6,-5);
    contextualizeNodesCCLE(cy, cell_line);
    $('#menu').modal('hide');
  });

  $("#downloadPySB").click(function(){
    var txt = $('#textArea')[0].value;
    txtProcess(txt, parser).then(groundingMapper).then(assemblePySB).then(function (res) {
      download('model.py', res['model']);
    });
  });

  $("#downloadSBML").click(function(){
    var txt = $('#textArea')[0].value;
    txtProcess(txt, parser).then(groundingMapper).then(assembleSBML).then(function (res) {
      download('model.sbml', res['model']);
    });
  });

  $("#downloadSBGN").click(function(){
    var txt = $('#textArea')[0].value;
    txtProcess(txt, parser).then(groundingMapper).then(assembleSBGN).then(function (res) {
      download('model.sbgn', res['model']);
    });
  });

  $("#downloadKappa").click(function(){
    var txt = $('#textArea')[0].value;
    txtProcess(txt, parser).then(groundingMapper).then(assembleKappa).then(function (res) {
      download('model.ka', res['model']);
    });
  });

  $("#downloadBNGL").click(function(){
    var txt = $('#textArea')[0].value;
    txtProcess(txt, parser).then(groundingMapper).then(assembleBNGL).then(function (res) {
      download('model.bngl', res['model']);
    });
  });

  $("#downloadCX").click(function(){
    var txt = $('#textArea')[0].value;
    txtProcess(txt, parser).then(groundingMapper).then(assembleCX).then(function (res) {
      download('model.cx', res['model']);
    });
  });

  $("#NDEX").click(function(){
    var txt = $('#textArea')[0].value;
    var modal = $('#ndexModal')
    var modal_body = modal.find('.modal-body')[0]
    modal_body.innerHTML = null
    var par = document.createElement("p");
    par.textContent = 'Uploading model to NDEX...'
    modal_body.append(par)
    txtProcess(txt, parser).then(groundingMapper).then(shareNDEX).then(function (res) {
      par.textContent = 'Network uploaded to NDEX.'
      var par2 = document.createElement("p");
      var network_address =  "http://ndexbio.org/#/network/" + res['network_id']
      var temp_link = document.createElement("a");
      temp_link.href = network_address;
      temp_link.text = network_address;
      temp_link.target = '_blank';
      par2.append(temp_link);
      modal_body.append(par2);
    });
  });

  $("#downloadINDRA").click(function(){
    var txt = $('#textArea')[0].value;
    txtProcess(txt, parser).then(groundingMapper).then(function (res) {
      download('stmts.json', JSON.stringify(res['statements'], null, 2));
    });
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

    txtProcess(txt, parser).then(groundingMapper).then(assembleLoopy).then(function (res) {

        window.open(
          res['loopy_url'].toString(),
          "_blank"
        );
    });
  });


$("#loadButtonStatic").click(function(){
  model_components_promise.then(function (promises) {
    preset_pos = promises[1];
    var model_response = promises[0];
    drawCytoscape ('cy_1', model_response);
    qtipNodes(scapes['cy_1']);
    scapes['cy_1'].fit();
    modalEdges(cy);
    scapes['cy_1'].fit();
  });
  var stmts = ras_stmts_response;
  var sentences = ras_sentences_response;
});

$(".cyjs2loopy").click(function(){
  var model = loopyFromCyJS("cy_1");
  window.open(
    'http://ncase.me/loopy/v1/?data=' + model,
    "_blank"
  );
});

$(".presetLayout").click(function(){
  if (this.classList.contains("active")){
    $(".presetLayout").removeClass("active");
    preset_pos = {};
  }
  else {
    $(".presetLayout").addClass("active");
    preset_pos = preset_pos_static;
  }
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
  grabJSON('static/models/' + prebuilt_model + '/model.json').then(function (model_response) {
    drawCytoscape ('cy_1', model_response);
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
  document.getElementById("loadButtonStatic").click();
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
