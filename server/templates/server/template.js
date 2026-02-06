// server/template.js
function render(templateString, vars) {
    return templateString.replace(/\{\{(\w+)\}\}/g, (_, k) => {
      const val = vars[k];
      return (val === undefined || val === null) ? '' : String(val);
    });
  }
  module.exports = { render };