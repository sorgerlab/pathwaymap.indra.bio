var default_colors = ['#fdbb84','#fee8c8','#e34a33', '#3182bd', '#000000', '#bdbdbd'];
// [orange, light orange, RED, blue, black, gray]

function drawCytoscape (div_id, model_elements) {
    cy = cytoscape({
      container: document.getElementById(div_id),

      elements: model_elements,

      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(name)',
            'width': '200px',
            'height': '200px',
            'border-width': 7,
            'border-color': default_colors[4],
            'background-color':default_colors[5],
            'background-opacity': 1,
            'font-size': '40px',
            'text-halign': 'above',
            'text-valign': 'center',
            'z-index': 2,
            'color': '#FFFFFF',
            'text-outline-color': '#000000',
            'text-outline-width': 5,
            'font-weight': 700,
            'text-wrap': 'wrap',
            'text-max-width': '200px'
          }
        },

        {
          selector: ':parent',
          style: {
            'label': '',
            'background-color': default_colors[1],
            'background-opacity': 1,
            'z-index': 1
          }
        },

        {
          selector: 'edge',
          style: {
          'line-color': default_colors[4],
          'target-arrow-color': default_colors[4],
          'width':13,
          'target-arrow-shape': 'triangle',
          'control-point-step-size': '140px',
          'z-index': 0,
          'curve-style':'bezier'
          },

        },

        {
          selector: '.complex',
          style: {
          'line-color': default_colors[3],
          'target-arrow-color': default_colors[3],
          'source-arrow-color': default_colors[3],
          //'width': '6px',
          'target-arrow-shape': 'circle',
          'source-arrow-shape': 'circle',
          'control-point-step-size': '140px',
          'z-index': 0
        }},

        {  selector: '.negative',
          style: {
          'line-color': default_colors[2],
          'target-arrow-color': default_colors[2],
          'source-arrow-color': default_colors[2],
          //'width': '6px',
          'target-arrow-shape': 'tee',
          'source-arrow-shape': 'none',
          'control-point-step-size': '140px',
          'z-index': 0
        }},

          {  selector: '.Attractor',
          style: {
            'display': 'none',
            //'visibility':'hidden',
            'z-index': 0,
            'curve-style':'bezier'

          }},

          {  selector: '.virtual',
          style: {
            'display': 'none',
            //'visibility':'hidden',
            'z-index': 0,
            'curve-style':'bezier'

          }},

          {  selector: '.transparentNode',
          style: {
            'opacity':0.7,
            'border-opacity': 0.15,
            'text-outline-opacity': 0.0,
            'color': default_colors[4],
            'text-opacity': 1
          }},

          {  selector: '.transparentEdge',
          style: {
            'opacity':0.3,

          }},

          {  selector: '.nAttractor',
          style: {
            'label': null,
            'width': '1px',
            'height': '1px',
            'padding-left': '1px',
            'padding-right': '1px',
            'display': 'none',
            'z-index': 0

          }},

          {  selector: '.hasMembers',
          style: {
            'width': '200px',
            'height': '200px',
            'content': 'data(name)',
            'pie-size': '100%',
            'border-width': 7,
            'border-color': default_colors[4],
            'background-color':default_colors[4],
            'pie-1-background-size':function(node){
              return node.data().pie_sizes[0];},
            'pie-2-background-size':function(node){
              return node.data().pie_sizes[1];},
            'pie-3-background-size':function(node){
              return node.data().pie_sizes[2];},
            'pie-4-background-size':function(node){
              return node.data().pie_sizes[3];},
            'pie-5-background-size':function(node){
              return node.data().pie_sizes[4];},
            'pie-6-background-size':function(node){
              return node.data().pie_sizes[5];},
            'pie-7-background-size':function(node){
              return node.data().pie_sizes[6];},
            'pie-8-background-size':function(node){
              return node.data().pie_sizes[7];},
            'pie-9-background-size':function(node){
              return node.data().pie_sizes[8];},
            'pie-10-background-size':function(node){
              return node.data().pie_sizes[9];},
            'pie-11-background-size':function(node){
              return node.data().pie_sizes[10];},
            'pie-12-background-size':function(node){
              return node.data().pie_sizes[11];},
            'pie-13-background-size':function(node){
              return node.data().pie_sizes[12];},
            'pie-14-background-size':function(node){
              return node.data().pie_sizes[13];},
            'pie-15-background-size':function(node){
              return node.data().pie_sizes[14];},
            'pie-16-background-size':function(node){
              return node.data().pie_sizes[15];},
            // slice colors according to expression bin
            'pie-1-background-color': function(node){
              return node.data().pie_colors[0];},
            'pie-2-background-color': function(node){
              return node.data().pie_colors[1];},
            'pie-3-background-color': function(node){
              return node.data().pie_colors[2];},
            'pie-4-background-color': function(node){
              return node.data().pie_colors[3];},
            'pie-5-background-color': function(node){
              return node.data().pie_colors[4];},
            'pie-6-background-color': function(node){
              return node.data().pie_colors[5];},
            'pie-7-background-color': function(node){
              return node.data().pie_colors[6];},
            'pie-8-background-color': function(node){
              return node.data().pie_colors[7];},
            'pie-9-background-color': function(node){
              return node.data().pie_colors[8];},
            'pie-10-background-color': function(node){
              return node.data().pie_colors[9];},
            'pie-11-background-color': function(node){
              return node.data().pie_colors[10];},
            'pie-12-background-color': function(node){
              return node.data().pie_colors[11];},
            'pie-13-background-color': function(node){
              return node.data().pie_colors[12];},
            'pie-14-background-color': function(node){
              return node.data().pie_colors[13];},
            'pie-15-background-color': function(node){
              return node.data().pie_colors[14];},
            'pie-16-background-color': function(node){
              return node.data().pie_colors[15];},
          }}
      ],

    });
    cy.startBatch();
    var params = {
      name: 'dagre',
      directed: 'true',
      fit: 'true',
      rankDir: 'TB',
      padding: 0,
    };
    // if a prior model has been built, use its positions for layout
    if (Object.keys(preset_pos).length !== 0) {
      cy.nodes().forEach(function(n){
        id_pos[n.id()] = preset_pos[n.data().name];
        // if a node is added and not in preset_pos, set its avg position based
        // on the other nodes it's connected to
        if (id_pos[n.id()] === undefined) {
          var cedges = n.connectedEdges();
        	var cnode_ids = [];
        	cedges.forEach(function(e){
        		if (e.target().id() !== n.id()){
        			cnode_ids.push(e.target().id());
        		}
        		if (e.source().id() !== n.id()){
        			cnode_ids.push(e.source().id());
        		}
        	});
        	var posxs = [];
        	var posys = [];
        	cnode_ids.forEach(function(i) {
        		if (id_pos[i] !== undefined){
        			posxs.push(id_pos[i]['x']);
        			posys.push(id_pos[i]['y']);
        		}
        	});
          // update preset_pos
        	preset_pos[n.data().name] = getAvgPos(posxs, posys);
          // update id_pos
          id_pos[n.id()] = preset_pos[n.data().name];
      }
    });
      params = {
        name: 'preset',
        positions: id_pos, // map of (node id) => (position obj); or function(node){ return somPos; }
        zoom: undefined, // the zoom level to set (prob want fit = false if set)
        fit: true, // whether to fit to viewport
        padding: 30, // padding on fit
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        ready: undefined, // callback on layoutready
        stop: undefined, // on layoutstop
      };
    }

    var layout = cy.makeLayout( params );
    layout.run();

    var params = {
      name: 'cola',
      nodeSpacing: 40,
      flow: { axis: 'y', },
      animate: true,
      randomize: false,
      maxSimulationTime: 2000,
      fit: false,
      infinite: false,
      ungrabifyWhileSimulating: false,
      // layout event callbacks
      ready: function(){
        cy.fit(30);
      }, // on layoutready
      stop: undefined, // on layoutstop
    };
    var layout = cy.makeLayout( params );
    layout.run();

    var params = {
      name: 'cola',
      nodeSpacing: 40,
      flow: { axis: 'y', },
      animate: true,
      randomize: false,
      maxSimulationTime: 2000,
      fit: false,
      infinite: false,
      ungrabifyWhileSimulating: false,
      // layout event callbacks
      ready: function(){
        //cy.fit(30)
      }, // on layoutready
      stop: undefined, // on layoutstop
    };
    var layout = cy.makeLayout( params );
    //layout.run();

    cy.endBatch();

    cy.one(('layoutstop'),function(){
      cy.panzoom({
        zoomFactor: 0.05, // zoom factor per zoom tick
        zoomDelay: 45, // how many ms between zoom ticks
        minZoom: 0.1, // min zoom level
        maxZoom: 10, // max zoom level
        fitPadding: 30, // padding when fitting
        panSpeed: 10, // how many ms in between pan ticks
        panDistance: 10, // max pan distance per tick
        panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
        panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
        panInactiveArea: 8, // radius of inactive area in pan drag box
        panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
        zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
        fitSelector: undefined, // selector of elements to fit
        animateOnFit: function(){ // whether to animate on fit
          return false;
        },
        fitAnimationDuration: 1000, // duration of animation on fit
      
        // icon class names
        sliderHandleIcon: 'fa fa-minus',
        zoomInIcon: 'fa fa-plus',
        zoomOutIcon: 'fa fa-minus',
        resetIcon: 'fa fa-expand'
      });
      $('.modal').on('show.bs.modal', function (e) {
        $(".cy-panzoom").css({"display": "none"});
      });
      $('.modal').on('hidden.bs.modal', function (e) {
        $(".cy-panzoom").css({"display": "unset"});
      });
    });

    var dragged = false;
    cy.on(('mousedown'),function(){
      layout.stop();
      cy.nodes().on(('drag'), function(){
        dragged = true;
    });
    });
    cy.on(('mouseup'),function(){
      if (dragged === true){
        layout.run();
        dragged = false;
      }
    });
    cy.on(('touchstart'),function(){
      layout.stop();
      cy.nodes().on(('drag'), function(){
        dragged = true;
      });
    });
    cy.on(('touchend'),function(){
      if (dragged === true){
        layout.run();
        dragged = false;
      }
    });

    cy.on(('layoutstop'),function(){
      nds = (cy.json()).elements.nodes;
      nds.forEach( function(n) {
        preset_pos[n.data.name] = n.position;
      });
    });



    cy.edges().forEach(function(e){
      if (e.data('i') === 'Complex'){
        e.addClass('complex');
      }
      if (e.data('polarity') === 'negative'){
        e.addClass('negative');
      }
      if (e.data('i') === 'Attractor'){
        e.addClass('Attractor');
      }
      if (e.data('i') === 'Virtual'){
        e.addClass('virtual');
      }
    });
    scapes[div_id] = cy;

    modalEdges(cy);
}

function cytoscapeFromJSON(div_id, cyjson){
  scapes[div_id] = cytoscape(cyjson)
}

function getAvgPos(posxs, posys) {
    if ((posxs.length > 0) && (posys.length > 0)){
        var x = posxs.reduce(function (p, c) {
            return p + c;
            }) / posxs.length;
        var y = posys.reduce(function (p, c) {
            return p + c;
            }) / posys.length;
        return ({'x': x, 'y' : y});
    }
  }
