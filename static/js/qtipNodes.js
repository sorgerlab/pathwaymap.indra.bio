function qtipNodes(cy){
    cy.startBatch();
    cy.nodes().forEach(function(n){
        var data = n.data();
        // if the node has members, build pie chart background arrays, qtips
        if (data.hasOwnProperty("members")){
          members = data.members;
          var fam_length = Object.keys(members).length;
            if (fam_length > 0){
              var content = []; // stores the db_links
              for (var gene in members) {
                var db_links = [];
                for (var namespace in members[gene]['db_refs']){
                  if (namespace !== 'TEXT'){
                    var tip_content = {id: gene,
                                       name: namespace,
                                       url: members[gene]['db_refs'][namespace]
                                     };
                    db_links.push(tip_content);
                  }
                } // for (var namespace ...)
                content.push(db_links);
            }
            var list_lines = content.map(function( link ){
            var line = '<b style="font-size:13px">' + String(link[0].id) + '</b>' + ' ' +
                       '<a  style="font-size:11px" target="_blank" href=https://www.citeab.com/antibodies/search?q="' + link[0].id + '">' +  "CiteAb"  + '</a>&nbsp;' +
                       '<a  style="font-size:11px" target="_blank" href="' + link[0].url + '">' + link[0].name + '</a>&nbsp;' +
                       '<a style="font-size:11px" target="_blank" href="' + link[1].url + '">' + link[1].name  + '</a>';
            return line;
            });

            var content_str = list_lines.map(function( line ){
              return '<li>' + line + '</li>';
            }).join('');
            content_str = '<ul>' + content_str + '</ul>';

            var qtip_title_str = n.data().name
            if (n.data().name !=  n.data().db_refs.TEXT){
              qtip_title_str += " (text mention: " + n.data().db_refs.TEXT +  ")"
            }
            qtip_api_call = {
              content: {
                title: '<b style="font-size:14px">' + qtip_title_str + '</b>',
                text: content_str
              },
              position: {
                my: 'top center',
                at: 'bottom center'
              },
              style: {
                classes: 'qtip-light',
                tip: {
                  width: 16,
                  height: 8
                }
              }
          };
            n.data('qtip', qtip_api_call);
        }

        }// member check


        // call out to qtip api if node is not parent
        if (n.isParent() == false){
            var gene = n.data().name;
          if (n.data().qtip){
            tip = n.data().qtip;
            n.qtip(tip);
          }
          else {
            var content_text = [];
            content_text.push(
                {name : "CiteAb", url: "https://www.citeab.com/antibodies/search?q=" + n.data().name});
            if (data.hasOwnProperty("db_refs")){
              db_refs = data.db_refs;
              for (var namespace in db_refs) {
                content_text.push(
                  {name : namespace, url: db_refs[namespace]});
              }
            }
            var qtip_title_str = n.data().name
            if (n.data().name !=  n.data().db_refs.TEXT){
              qtip_title_str += " (text mention: " + n.data().db_refs.TEXT +  ")"
            }
            n.qtip({
              content: {title: '<b style="font-size:14px">' + qtip_title_str + '</b>',
                text: content_text.filter(function(link){
                  if (link.name == "TEXT") {
                    return false;
                  }
                  return true;
                }).map(function( link ){
                  var link_string = '<a target="_blank" href="' + link.url + '">' + link.name + '</a>'
                  return link_string;
                }).join('<br />')
            },
              position: {
                my: 'top center',
                at: 'bottom center'
              },
              style: {
                classes: 'qtip-light',
                tip: {
                  width: 16,
                  height: 8
                }
              }
            });// n.qtip
          }
        } // check if n.isParent()

      });
  cy.endBatch();
}
