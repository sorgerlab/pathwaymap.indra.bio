function highlightPath(cy, path_uuids){
    cy.startBatch();
    // nodes
    cy.nodes().forEach(function(n){
        var see_thru = true;
        var data = n.data();
            // get each node's uuid_list and check if it is in the path
            var uuid_list = n.data().uuid_list;
            for (var u of uuid_list){
              // if the uuid is in the path, make it not see_thru
              if (path_uuids.indexOf(u) !== -1){
                see_thru = false;
                break;
              }
            }
            // if still see_thru, then add the .transparent class
            if (see_thru === true){
              n.addClass('transparentNode');
            }
      });
      cy.edges().forEach(function(e){
          var see_thru = true;
          var data = e.data();
          // only act on non-virtual edges, as virtual edges aren't rendered
          if (e.hasClass('virtual') === false){
              // get each edge's uuid_list and check if it is in the path
              var uuid_list = e.data().uuid_list;
              for (var u of uuid_list){
                // if the uuid is in the path, make it not see_thru
                if (path_uuids.indexOf(u) !== -1){
                  see_thru = false;
                  break;
                }
              }
              // if still see_thru, then add the .transparent class
              if (see_thru === true){
                e.addClass('transparentEdge');
              }
            }
        });
  cy.endBatch();
}


// removes .transparent class from all elements in the specified cytoscape obj
function unHighlight(cy){
  cy.startBatch();
  cy.nodes().forEach(function(n){
    n.removeClass('transparent');
      if (n.hasClass('transparentNode') === false){
      }
  });
  cy.edges().forEach(function(e){
    e.removeClass('transparent');
    if (e.hasClass('transparentEdge') === false){
    }
  });
  cy.endBatch();
}
