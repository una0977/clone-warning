(function() {
    var banner = document.getElementById('clone-warning-banner');

    function hideBanner() { if (banner) banner.style.display = 'none'; }
    function showBanner() { if (banner) banner.style.display = 'flex'; }

    var issueKey = null;

    var params = new URLSearchParams(window.location.search);
    issueKey = params.get('issueKey') || params.get('issue.key') || params.get('key');

    if (!issueKey) {
        try {
            var parentPath = window.parent.location.pathname;
            var m = parentPath.match(/\/browse\/([^/?#]+)/);
            if (m) issueKey = m[1];
        } catch(e) {}
    }

    if (!issueKey) {
        try {
            var parentParams = new URLSearchParams(window.parent.location.search);
            issueKey = parentParams.get('selectedIssue');
        } catch(e) {}
    }

    if (!issueKey) { hideBanner(); return; }

    fetch('/rest/api/3/issue/' + issueKey + '?fields=parent', {
        credentials: 'same-origin'
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        var parent = data && data.fields && data.fields.parent;
        if (!parent) { hideBanner(); return; }

        return fetch('/rest/api/3/issue/' + parent.key + '?fields=status', {
            credentials: 'same-origin'
        })
        .then(function(r) { return r.json(); })
        .then(function(parentData) {
            var catKey = parentData.fields
                && parentData.fields.status
                && parentData.fields.status.statusCategory
                && parentData.fields.status.statusCategory.key;

            if (catKey === 'done') { showBanner(); } else { hideBanner(); }
        });
    })
    .catch(function(e) { console.warn('Clone warning error:', e); hideBanner(); });
})();
