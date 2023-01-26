setInterval(() => {
    $('.red-black-tree .node,.red-black-tree .nil').connections('remove');
    document.querySelectorAll('.red-black-tree.node').forEach(p => {
        console.log(p);

        p.id = "TEMP_UPDATE_CONNECTIONS";
        $().connections({ from: '#TEMP_UPDATE_CONNECTIONS', to: '.red-black-tree .node, .red-black-tree .nil' });
        p.id = "";
    })
}, 1000);

// INSERT 37 42 47 21 46 18 30 33 9 6 7 45 3 29 43