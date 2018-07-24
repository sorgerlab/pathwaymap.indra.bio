function modalEdges(cy){
    cy.edges().on('tap', function(e){
        var current_edge = this;
        var src_tar_list = getSourcesTargets(current_edge)
        var edge_uuids = getUUIDs(current_edge)
        // console.log(src_tar_list);
        // console.log(edge_uuids)
        var sources = src_tar_list[0];
        var targets = src_tar_list[1];
        $('#edgeModal').modal('show')
        var sources_div = $('#edgeModal').find('.modal-body').find('.edgeModal-sources')[0]
        sources_div.innerHTML = null
        for (var s of sources){
            var source_button = document.createElement("button");
            source_button.classList.add('btn')
            source_button.classList.add('btn-default')
            source_button.classList.add('btn-src')
            source_button.textContent = s.data().name
            source_button.dataset.id = s.data().id
            sources_div.appendChild(source_button)
            sources_div.append(" ")
        }
        var targets_div = $('#edgeModal').find('.modal-body').find('.edgeModal-targets')[0]
        targets_div.innerHTML = null
        for (var t of targets){
            var target_button = document.createElement("button");
            target_button.classList.add('btn')
            target_button.classList.add('btn-default')
            target_button.classList.add('btn-targ')
            target_button.textContent = t.data().name
            target_button.dataset.id = t.data().id
            targets_div.appendChild(target_button)
            targets_div.append(" ")
            
        }
        var f_uuids = getFilteredUUIDs(current_edge);
        deactivateAllButtons()
        updateStmtsBox(f_uuids)
        $(".btn-src").on('click', function(b){
            toggleButton(b.target)
            f_uuids = getFilteredUUIDs(current_edge)
            console.log(f_uuids)
            updateStmtsBox(f_uuids)
        })
        $(".btn-targ").on('click', function(b){
            toggleButton(b.target)
            f_uuids = getFilteredUUIDs(current_edge)
            console.log(f_uuids)
            updateStmtsBox(f_uuids)
        })
    })
}


function getSourcesTargets(edge){
    var sources = [];
    var source = edge.source();
    if (source.isParent()){
        console.log('source is compound');
        var children = source.children();
        children.forEach(function (child) {
            sources.push(child)
        })
    }
    else {
        sources.push(source);
    }
    var targets = [];
    var target = edge.target();
    if (target.isParent()){
        console.log('target is compound');
        var children = target.children();
        children.forEach(function (child) {
            targets.push(child)
        })
    }
    else {
        targets.push(target);
    }
    return [sources, targets];
}

function getUUIDs(ele){
    return ele.data().uuid_list
}


function intersectLists(list_of_lists){
    var merged_set = new Set();
    for (var ll of list_of_lists){
        var ll_set = new Set(ll);
        merged_set = union(merged_set, ll_set);
    }
    var intersect_set = new Set(merged_set);
    for (var ll of list_of_lists){
        var ll_set = new Set(ll);
        intersect_set = intersection(intersect_set, ll_set);
    }
    return intersect_set;
}

function intersection(setA, setB) {
    var _intersection = new Set();
    for (var elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}

function union(setA, setB) {
    var _union = new Set(setA);
    for (var elem of setB) {
        _union.add(elem);
    }
    return _union;
}

// statements.filter(st => st.id == "afb92699-ccad-4cef-a56c-adda79a7688a")


function toggleButton(button){
    var button_classes = ["btn-src", "btn-targ"];
    for (var button_class of button_classes){
        if ([...button.classList].indexOf(button_class) !== -1){
            var class_str = "." + button_class
            for (b of $(class_str)){
                b.classList.remove('active')
            }
        }
    }
    button.classList.add('active')
}

function deactivateAllButtons(){
    var button_classes = ["btn-src", "btn-targ"];
    for (var button_class of button_classes){
        var class_str = "." + button_class
        for (b of $(class_str)){
            b.classList.remove('active')
        }
    }
}

function getActiveButtons(){
    var src_active = $(".btn-src.active")[0]
    var targ_active = $(".btn-targ.active")[0]
    return [src_active, targ_active]
}

function getFilteredUUIDs(edge){
    var active_btns = getActiveButtons()
    var element_array = [edge, edge, edge]
    if (active_btns[0] !== undefined){
        element_array[0] = cy.getElementById(active_btns[0].dataset.id)
    }
    if (active_btns[1] !== undefined){
        element_array[1] = cy.getElementById(active_btns[1].dataset.id)
    }
    console.log(element_array)
    var list_of_uuid_lists = [element_array[0].data().uuid_list,
                              element_array[1].data().uuid_list,
                              element_array[2].data().uuid_list,]
    var filtered_uuids = intersectLists(list_of_uuid_lists)
    return filtered_uuids
}

function getStatementsByUUID(uuid_list, stmts_list){
    let stmts_list_f = stmts_list.filter(st => (uuid_list.includes(st.id)))
    return stmts_list_f
}

function statementPanelAddEvidence(button_ele){
    let parent_panel = ($(button_ele).parent().parent().parent().parent()[0]);
    $(parent_panel).find(".ev-panel" ).remove();
    let uuid = button_ele.dataset.id;
    let evidence_stmts = evidence[uuid];
    var evs = [];
    for (st of evidence_stmts){
	    for (ev of st.evidence){
		    evs.push([ev.text, ev.pmid])
	    }
    }
    for (ev of evs){
        var ev_panel = document.createElement("div");
        ev_panel.classList.add('panel', 'panel-default', 'ev-panel');
        var ev_panel_body = document.createElement("div");
        ev_panel_body.classList.add('panel-body');
        var par = document.createElement("p");
        par.textContent = ev[0];
        par.style.fontSize = "14px";
        var link_out = document.createElement("a");
        var addr = "https://www.ncbi.nlm.nih.gov/pubmed/" + String(ev[1])
        link_out.setAttribute('href', addr);
        link_out.target = '_blank';
        var fa_icon = document.createElement("i");
        fa_icon.classList.add("fas", "fa-external-link-alt");
        fa_icon.style.paddingLeft = "5px";
        link_out.appendChild(fa_icon);
        par.appendChild(link_out);
        ev_panel_body.appendChild(par);
        ev_panel.appendChild(ev_panel_body);
        parent_panel.appendChild(ev_panel);
    }
}

function updateStmtsBox(uuid_set){
    var uuid_list = new Array(...uuid_set)
    var stmts_box = $('#edgeModal').find('.modal-body').find('.edgeModal-stmtsbox')[0]
    stmts_box.innerHTML = null
    if (stmts !== undefined){
        for (var u of uuid_list){
            var panel_group = document.createElement("div");
            panel_group.classList.add('panel-group', 'panel', 'panel-default');
            var panel = document.createElement("div");
            panel.classList.add('panel');
            panel.classList.add('panel-default');
            var panel_body = document.createElement("div");
            panel_body.classList.add('panel-body');
            var par = document.createElement("p");
            par.textContent = sentences.sentences[u];
            var ev_button_div = document.createElement("div");
            var ev_button = document.createElement("button");
            ev_button.classList.add('btn', 'btn-default', 'btn-evidence', 'pull-right');
            ev_button.textContent = "Get evidence";
            ev_button.dataset.id = u;
            var sel_stmt = getStatementsByUUID([u], stmts.statements)[0];
            var json_view = renderjson(sel_stmt);
            panel_body.appendChild(par);
            panel_body.appendChild(json_view);
            ev_button_div.appendChild(ev_button);
            panel_body.appendChild(ev_button_div);
            panel.appendChild(panel_body);
            panel_group.appendChild(panel);
            stmts_box.appendChild(panel_group);
        }
    }
    $(".btn-evidence").on('click', function(b){
        let button_ele = b.currentTarget;
        let uuid = b.currentTarget.dataset.id;
        let selected_stmt = getStatementsByUUID([uuid], stmts.statements)[0];
        let ev_query = {'statement': selected_stmt};
        if (evidence[uuid]){
            console.log(evidence[uuid]);
            statementPanelAddEvidence(button_ele);
        }
        else {
            let evidence_promise = getEvidence(ev_query);
            evidence_promise.then(function(res){
                console.log(res.statements);
                evidence[uuid] = res.statements;
                statementPanelAddEvidence(button_ele)
            })
        }
    })
}
