import * as main from './main';
var startHTML = "\n  <div class=\"repl\">\n      <!-- To hold the command history -->\n      <div class=\"repl-history\">\n        <table>\n          <thead></thead>\n          <tbody id=\"repl-results\" data-testid=\"results\" />\n        </table>\n      </div>\n      <hr />\n      <!-- To hold the command input box -->\n      <div class=\"repl-input\">\n        <input\n          type=\"text\"\n          class=\"repl-command-box\"\n          placeholder=\"Type in command here. Press ENTER to run the command.\"\n          data-testid=\"command\"\n        />\n      </div>\n    </div>\n    <!-- Load the script! Note: the .js extension is because browsers don't use TypeScript\n    directly. Instead, the author of the site needs to compile the TypeScript to JavaScript. -->\n    <script type=\"module\" src=\"../src/main.js\"></script>\n";
beforeEach(function () {
    document.body.innerHTML = startHTML;
    main.clearHistory();
    main.initializeGlobalVariables();
    main.prepareKeypress();
});
// search on an unloaded file
test('search CSV with no file loaded', function () {
    expect(main.runSearchCommand(['search', 'Name', 'Tiger'], 'outputPrompt')).toStrictEqual([
        "<tr class='message'><td>outputPrompt[Error] No csv is selected.</td></tr>",
    ]);
});
// search non-existent column
test('search non-existent column', function () {
    expect(main.runSearchCommand(['search', 'Name', 'boot'], 'outputPrompt')).toStrictEqual(["<tr class='message'><td>outputPrompt[Error] No csv is selected.</td></tr>"]);
});
// search CSV and print results
test('search CSV with numbers', function () {
    main.runLoadFileCommand(['load_file', 'cats'], 'outputPrompt');
    expect(main.runSearchCommand(['search', 'Age', '2'], 'outputPrompt')).toStrictEqual([
        "<tr class='message'><td>outputPrompt1 row found in cats.</td></tr>",
        "<tr class='userData'><td>Fluffy</td><td>2</td><td>White</td><td>Persian</td><td>Playful and curious</td></tr>",
    ]);
});
// search CSV with no inputs
test('search CSV with no arguments', function () {
    main.runLoadFileCommand(['load_file', 'cats'], 'outputPrompt');
    expect(main.runSearchCommand(['search'], 'outputPrompt')).toStrictEqual([
        "<tr class='message'><td>outputPrompt[Error] No search term provided.</td></tr>",
    ]);
});
// search CSV with too many inputs
test('search CSV with too many inputs', function () {
    main.runLoadFileCommand(['load_file', 'cats'], 'outputPrompt');
    expect(main.runSearchCommand(['search', 'i', 'o', 'p'], 'outputPrompt')).toStrictEqual([
        "<tr class='message'><td>outputPrompt[Error] Too many search terms provided.</td></tr>",
    ]);
});
// search column index out of range
test('search column index out of range', function () {
    main.runLoadFileCommand(['load_file', 'cats'], 'outputPrompt');
    expect(main.runSearchCommand(['search', '10', 'Tiger'], 'outputPrompt')).toStrictEqual([
        "<tr class='message'><td>outputPrompt[Error] Column index out of bounds.</td></tr>",
    ]);
});
// set file Path To CSV
test('setPathToCsv', function () {
    main.setPathToCsv("cats");
    expect(main.getOutputMessage("", "cats is loaded.")).toStrictEqual([
        "<tr class='message'><td>cats is loaded.</td></tr>",
    ]);
});
// get output message
test('getOutputMessage', function () {
    expect(main.getOutputMessage('prompt', 'content')).toStrictEqual([
        "<tr class='message'><td>promptcontent</td></tr>",
    ]);
});
