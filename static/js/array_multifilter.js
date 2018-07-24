function array_multifilter(arr, f_arr){
  // given an array of arrays, and an filter array that represents the inner arr
  // return a subset of the original array that matches the pattern
  var filtered_arr = arr;
  function array_filter(arr, val, pos){
    var filtered_arr = arr.filter(function(row){
      return row[pos] == val;
    });
    return filtered_arr;
  }
  for (var i in f_arr){
    if (f_arr[i] !== ""){
      filtered_arr = array_filter(filtered_arr, f_arr[i], i);
    }
  }
  return filtered_arr;
}


//get a column
function extractColumn(arr, column) {
	function reduction(previousValue, currentValue) {
		previousValue.push(currentValue[column]);
		return previousValue;
	}
	return arr.reduce(reduction, []);
}
// return array of uniques
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}


function get_unique_col_vals(arr){
  var uniques_arr = [];
  for (var i=0; i<=arr[0].length; i++){
    uniques_arr.push(extractColumn(arr, i).filter(onlyUnique));
  }
  return uniques_arr;
}

function clearCtxtSelects(){
  var ctx_pickers = $('.ctx-select .selectpicker');
  for (var p of ctx_pickers){
    while (p.options.length > 0) {
        p.remove(0);
    }
  }
  $('.ctx-select').selectpicker('refresh').selectpicker('render');
}

function build_ctx_dropdowns(arr, ctx_select_divs, current_ctx_selection){
  unique_col_val = get_unique_col_vals(arr);
  for (var i in ctx_select_divs){
    dropdownCtxtSelectFromJSON(ctx_select_divs[i], unique_col_val[i]);
    $(ctx_select_divs[i]).selectpicker('val', current_ctx_selection[i]);
  }
  $('.ctx-select').selectpicker('refresh').selectpicker('render');
}
