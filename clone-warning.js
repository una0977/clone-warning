(async function () {
  const box = document.getElementById("clone-warning");

  function show(text) {
    box.innerHTML = text;
  }

  function hide() {
    box.innerHTML = "";
  }

  try {
    if (!window.AdaptavistBridge || !window.AdaptavistBridgeContext) {
      show("Debug: Adaptavist Bridge not loaded.");
      return;
    }

    const issueKey = window.AdaptavistBridgeContext.context.issueKey;

    if (!issueKey) {
      show("Debug: issueKey not found.");
      return;
    }

    const issue = await window.AdaptavistBridge.request({
      url: `/rest/api/3/issue/${issueKey}?fields=parent`,
      type: "GET"
    });

    const parentKey = issue.fields?.parent?.key;

    if (!parentKey) {
      hide();
      return;
    }

    const parentIssue = await window.AdaptavistBridge.request({
      url: `/rest/api/3/issue/${parentKey}?fields=issuetype,status`,
      type: "GET"
    });

    const parentIssueType = parentIssue.fields?.issuetype?.name;
    const parentStatusCategory = parentIssue.fields?.status?.statusCategory?.key;

    if (parentIssueType === "Epic" && parentStatusCategory === "done") {
      show(`
        <div class="clone-warning-box">
          Clone for this issue is disabled. Please use the <strong>Clone without parent</strong> option.
        </div>
      `);
    } else {
      hide();
    }
  } catch (e) {
    show("Debug error: " + e.message);
  }
})();
