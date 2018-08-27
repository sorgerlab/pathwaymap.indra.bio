function contextualizeNodesCCLE(cy, cell_line){
  var gene_names = get_cy_gene_names(cy);
  var mrna_promise = get_ccle_mrna(gene_names, cell_line)
  var mutations_promise = get_ccle_mutations(gene_names, cell_line)
  Promise.all([mrna_promise, mutations_promise]).then(function(pp){
    mrna = pp[0]
    mutations = pp[1]
    set_context(cy, gene_names, mrna, mutations);
  }) 
}

function contextualizeNodesCCLEprebuilt(cy, mrna, mutations){
  var gene_names = get_cy_gene_names(cy);
  set_context(cy, gene_names, mrna, mutations);
}

function set_context(cy, gene_names, mrna, mutations){
  var cl = [Object.keys(mrna.mrna_amounts)[0]][0]
  var mrna_v = mrna.mrna_amounts[cl]
  var mutations_v = mutations.mutations[cl]
  cy.startBatch();
  var mutated = {};
  gene_names.forEach(function(n){
    mutated[n] = 0;
  });
  gene_names.forEach(function(n){
    mutated[n] = mutations_v[n].length;
  });
  cy.nodes().forEach(function(n){
      var data = n.data();
      if (data.hasOwnProperty("members")){
        members = data.members;
        var fam_length = Object.keys(members).length;
          if (fam_length > 0){
            var pie_sizes = new Array(16).fill(0);
            var pie_colors = new Array(16).fill(default_colors[5]);
            var current_slice = 0;
            for (var gene in members) {
              var exp_val = mrna_v[gene];
              var mut_val = mutated[gene];
              pie_sizes[current_slice] = (100*(1/fam_length));
              // if a gene exists in the context object, set its color
              // if a gene does not exist in context, it is already grey
              // as per the array conditions above
              if (exp_val !== null){
                  if (((mut_val) < 1) && ((exp_val) !== undefined)){
                    pie_colors[current_slice] = exp_colorscale(exp_val);
                  }
                  if (((mut_val) >= 1) && ((exp_val) !== undefined)){
                    pie_colors[current_slice] = mut_colorscale(exp_val);
                  }
              }

              current_slice += 1;
            }
          n.data('pie_sizes', pie_sizes);
          n.data('pie_colors', pie_colors);
          n.addClass('hasMembers');
          }
      }// member check

      // call out to qtip api if node is not parent
      if (n.isParent() == false){
          var gene = n.data().name;
          var exp_val = mrna_v[gene];
          var mut_val = mutated[gene];
          if (exp_val !== null){
              var bkg_col = default_colors[5];
              if (((mut_val) < 1) && ((exp_val) !== undefined)){
                bkg_col = exp_colorscale(exp_val);
              }
              if (((mut_val) >= 1) && ((exp_val) !== undefined)){
                bkg_col = mut_colorscale(exp_val);
              }
              n.style({'background-color' : bkg_col});
          }
      } // check if n.isParent()

    });
    cy.endBatch();
}