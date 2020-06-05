function activateGraph (graph) {
    var data = JSON.parse(graph);

    const NODE_R = 15;

    var elem = document.getElementById('graph');

    // Audio
    var context = initializeNewWebAudioContext();
    var playingSound; // keep track of playing sound to stop it

    function playSound(d) {
        // load and play sound
        context.loadSound(d.url, '0');
        playingSound = context.playSound('0');
    }

    function stopSound() {
        // stop playing sound
        if (playingSound) {
            playingSound.pause();
        }
    }

    function onNodeHover(node) {
        if (node) {
            elem.style.cursor = 'pointer';
            stopSound();
            playSound(node);
        } else {
            elem.style.cursor = null;
            stopSound();
        }
        hoverNode = node || null;
    }

    nodeById = new Map();
    data.nodes.forEach(function (node) {
        nodeById.set(node.id, node);
    });

    // cross-link node objects
    data.links.forEach(link => {
        const a = nodeById.get(link.source);
        const b = nodeById.get(link.target);
        !a.neighbors && (a.neighbors = []);
        !b.neighbors && (b.neighbors = []);
        a.neighbors.push(b);
        b.neighbors.push(a);
    
        !a.links && (a.links = []);
        !b.links && (b.links = []);
        a.links.push(link);
        b.links.push(link);
    });

    const highlightNodes = new Set();
    const highlightLinks = new Set();
    let hoverNode = null;

    function connectedNodes(node) {
        highlightNodes.clear();
        highlightLinks.clear();
        if (node) {
            highlightNodes.add(node);
            node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
            node.links.forEach(link => highlightLinks.add(link));
        }
        hoverNode = node || null;
        elem.style.cursor = node ? '-webkit-grab' : null;

        // show sound info
        $("#h1").html(node.name + '   centrality: ' + node.group_centrality);
        $("#h2").html(node.tags);
        $("#h3").html('<a href="' + node.sound_page_url + '">' + node.sound_page_url + '</a>');
    }

    function onclick() {
        highlightNodes.clear();
        highlightLinks.clear();
        $("#h1").html('Sound file name');
        $("#h2").html('Click on a node to display info');
        $("#h3").html('');
    }

    var width = elem.parentElement.getBoundingClientRect().width;
    var height = elem.parentElement.getBoundingClientRect().height;

    var Graph = ForceGraph()(elem);
    Graph.backgroundColor('rgba(128, 128, 128, 0.0)')
        .width(width)
        .height(height)
        .nodeRelSize(NODE_R)
        .nodeCanvasObject((node, ctx) => {
            // add ring just for highlighted nodes
            ctx.beginPath();
            ctx.arc(node.x, node.y, NODE_R * 1.2, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'white';
            ctx.fill();
        })
        .nodeLabel(node => `${node.name}: ${node.tags}`)
        .nodeAutoColorBy('group')
        .linkColor(() => 'rgba(0,0,0,0.2)')
        .onBackgroundClick(() => onclick())
        .onNodeHover(node => onNodeHover(node))
        .onNodeClick(node => {
            connectedNodes(node);
        })
        .linkWidth(link => highlightLinks.has(link) ? 3 : 1)
        .nodeCanvasObjectMode(node => 'before')
        .nodeCanvasObject((node, ctx) => {
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(node.x, node.y, NODE_R * 1.2, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'white';
            ctx.fill();
            if (hoverNode === node) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(node.x, node.y, NODE_R * 1.2, 0, 2 * Math.PI, false);
                ctx.fillStyle = node.color
                ctx.fill();
            }
            if (highlightNodes.size > 0) {
                if (highlightNodes.has(node)) {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
                    ctx.fillStyle = 'white';
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, NODE_R * 1.2, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color
                    ctx.fill();
                } else {
                    ctx.globalAlpha = 0.5;
                }
            }
        })

    var nodes = data.nodes;
    Graph
        .d3Force('collide', d3.forceCollide(Graph.nodeRelSize()*1.3))
        .d3Force('box', () => {
        const SQUARE_HALF_SIDE = Graph.nodeRelSize() * 800 * 0.5;
        nodes.forEach(node => {
            const x = node.x || 1, y = node.y || 1;
            // bounce on box walls
            if (Math.abs(x) > SQUARE_HALF_SIDE) { node.vx *= 0; }
            if (Math.abs(y) > SQUARE_HALF_SIDE) { node.vy *= 0; }
        });
        })
        .zoom(1)
        .graphData(data);
}
