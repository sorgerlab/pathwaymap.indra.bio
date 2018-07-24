function get_cy_gene_names(cy){
  var all_gene_names = [];
  cy.nodes().forEach(function(n){
    var data = n.data();
    if (data.hasOwnProperty("db_refs")){
      if (data.db_refs.hasOwnProperty("HGNC")){
        all_gene_names.push(data.name);
      }
    }
    if (data.hasOwnProperty("members")){
      var fam_length = Object.keys(data.members).length;
        if (fam_length > 0){
          for (var gene in data.members){
            if (data.members[gene].hasOwnProperty("db_refs")){
              if (data.members[gene].db_refs.hasOwnProperty("HGNC")){
                all_gene_names.push(gene);
              }
            }
          }
        }
    }
  });
  return all_gene_names;
}
