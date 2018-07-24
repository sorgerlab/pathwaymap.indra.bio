function phosphoContextSN(cy, dataset, condition){
    var removed;
    for (var a of ['mousedown', 'mouseup', 'touchstart', 'touchend', 'layoutstop']){
     scapes['cy_1'].off(a);
    }
    var linear_scale = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range(["blue", "white", "red"]);
    cy.elements().forEach(function(e){
      e.addClass('original');
    });
    var nodes = [];
    var cmp_nodes = {};
    // var site_edges = [];
    var abundances = {};
    var cond = dataset[condition];
    var genes = Object.keys(cond);
    var radius;
    var small_radius;
    for (var g of genes){
      var members = cond[g]['members'];
      var node = cy.$('node[name = ' +'"' + g + '"' + ']');
      if (node.length > 0){
         var abundance = cond[g]['node'];
         var abundance_values = abundance['values'];
         if (abundance_values.length > 0){
             var abundance_value = abundance_values[0];
             abundances[node.data('id')] = linear_scale(abundance_value);
         }
         cmp_nodes[node.data('id')] = [node.data('id')];
         var sites = members['sites'];
         radius = parseInt(node.style('width').substring(0, node.style('width').length-2))/2;
         var posx = node.position('x');
         var posy = node.position('y');
         var split = 12;
         small_radius = ((2*Math.PI*radius)/split)/2;
         // start small nodes at 4:30 position
         var rad_coord = (2*Math.PI)*(1/8);
         if (sites.length > 0){
             var values = members['values'];
             for (var site in sites) {
                var posx_a = posx + radius*Math.cos(rad_coord);
                var posy_a = posy + radius*Math.sin(rad_coord);
                rad_coord += (2*Math.PI)/10;
                var node_site = {group: "nodes", data: {id: node.data('id')+'_'+site,
                                                       name: sites[site],
                                                       uuid_list: node.data('uuid_list'),
                                                       pos_diff: {
                                                           'main_id': node.data('id'),
                                                           'dx': posx - posx_a,
                                                           'dy': posy - posy_a
                                                       }},
                                                style: {'width':small_radius*2,
                                                        'height':small_radius*2,
                                                        'background-color':linear_scale(values[site]),
                                                        'z-index': 10,
                                                        'text-halign': 'right',
                                                        'text-valign': 'center'},
                                                position: {'x': posx_a,
                                                           'y': posy_a},
                                                grabbable: false,
                                                selectable: false
                                };
                nodes.push(node_site);
                cmp_nodes[node.data('id')].push(node_site['data']['id']);
             }
         }
         cy.add(nodes);
         for (var i in abundances){
             var node = cy.$('node[id = ' +'"' + i + '"' + ']');
             node.style('background-color', abundances[i]);
         }
      }
    }

    for (var n_id in cmp_nodes){
        var n_ids = cmp_nodes[n_id].slice(1,cmp_nodes[n_id].length);
        var sub_selectors = [];
        for (var n2 of n_ids){
            var selector_string_sub = 'node[id = ' +'"' + n2 + '"' + ']';
            sub_selectors.push(selector_string_sub);
        }
        var selector_string = sub_selectors.join(',');
        var sub_cy = cy.$(selector_string);
        var node_tag = "sub"+n_id;
        sub_cy.nodes().forEach(function(n){
            n.addClass(node_tag);
        });
    }

    cy.$().not('.original').nodes().forEach(function(n){
        n.addClass('small_' + n.data('pos_diff')['main_id']);
        n.addClass('small');
    });


    function bindPosition(){
        cy.$('.original').on( 'position', function(evt){
            var node = evt.cyTarget;
            var node_tag = ".small_"+node.data('id');
            var posx = node.position('x');
            var posy = node.position('y');
            var associates = cy.$(node_tag);
            associates.nodes().forEach(function(assc){
                assc.position({'x': (posx - assc.data('pos_diff')['dx']),
                               'y': (posy - assc.data('pos_diff')['dy'])});
            });
        });
    }
    bindPosition();

    var params = {
      name: 'cola',
      nodeSpacing: 40,
      flow: { axis: 'y', },
      animate: true,
      randomize: false,
      maxSimulationTime: 1000,
      fit: false,
      infinite: false,
      ungrabifyWhileSimulating: false
    };
    var layout = cy.makeLayout( params );

    var animated_timer;
    var pull_duration = 300;
    function pullNodes () {
        cy.$('.original').nodes().forEach(function(node){
            var node_tag = ".small_"+node.data('id');
            var posx = node.position('x');
            var posy = node.position('y');
            var associates = cy.$(node_tag);
            associates.nodes().forEach(function(assc){
                assc.animate({
                    style: {'width': 1, 'height': 1,
                            },
                    duration: pull_duration,
                    complete: function(){
                        if (removed === undefined){
                                removed = cy.remove(assc);
                            }
                        else {
                            removed = removed.add(cy.remove(assc));
                        }
                        clearTimeout(animated_timer);
                        animated_timer = setTimeout(function() {
                            if (cy.$(':grabbed').length > 0){
                                cy.promiseOn('free').then(function(){
                                    if (dragged == true){
                                            clearTimeout(animated_timer);
                                            animated_timer = setTimeout(function() {
                                                layout.run();
                                                cy.promiseOn('layoutstop').then(function(){
                                                    if (removed !== undefined){
                                                        cy.add(removed);
                                                        removed = undefined;
                                                        pushNodes();
                                                    }
                                                });
                                            }, 50);
                                    }
                                });
                            }
                            else {
                                dragged = false;
                                layout.run();
                                cy.promiseOn('layoutstop').then(function(){
                                    if (removed !== undefined){
                                        cy.add(removed);
                                        removed = undefined;
                                        pushNodes();
                                    }
                                });
                            }

                        }, 50);
                    },
                    queue: false
                });
            });
        });
    }


    function pushNodes () {
        cy.$('.original').nodes().forEach(function(node){
            var node_tag = ".small_"+node.data('id');
            var posx = node.position('x');
            var posy = node.position('y');
            var associates = cy.$(node_tag);
            associates.nodes().forEach(function(assc){
                assc.animate({
                    style: {'width': small_radius*2, 'height':small_radius*2,
                            },
                    position: assc.position({'x': (posx - assc.data('pos_diff')['dx']),
                                             'y': (posy - assc.data('pos_diff')['dy'])}),
                    duration: pull_duration/3,
                    queue: true,
                    complete: function(){
                        dragged = false;
                    }
                });
            });
        });
    }

    var dragged = false;
    var animated;
    cy.$('.original').on(('drag'), function(){
        if (dragged === false){
            dragged = true;
            pullNodes();
        }
    });
}
