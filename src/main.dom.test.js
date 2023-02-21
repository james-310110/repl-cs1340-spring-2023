import * as main from './main';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import * as exampleCSVs from './mockedJson.js';
var startHTML = "\n  <div class=\"repl\">\n      <!-- To hold the command history -->\n      <div class=\"repl-history\">\n        <table>\n          <thead></thead>\n          <tbody id=\"repl-results\" data-testid=\"results\" />\n        </table>\n      </div>\n      <hr />\n      <!-- To hold the command input box -->\n      <div class=\"repl-input\">\n        <input\n          type=\"text\"\n          class=\"repl-command-box\"\n          placeholder=\"Type in command here. Press ENTER to run the command.\"\n          data-testid=\"command\"\n        />\n      </div>\n    </div>\n    <!-- Load the script! Note: the .js extension is because browsers don't use TypeScript\n    directly. Instead, the author of the site needs to compile the TypeScript to JavaScript. -->\n    <script type=\"module\" src=\"../src/main.js\"></script>\n";
/**
 * Testing instructions:
 *
 * use command.value to access the command input string
 * i.e. expect(command.value).toBe(expectedCommandAsString)
 *
 * use results.rows[index].innerHTML to access the result row in string format
 * i.e. expect(results.rows[i].innerHTML).toBe(expectedHtmlTableRowAsString)
 *  or
 * i.e. expect(results.rows[i].textContent).toBe(expectedTextRowAsString)
 *
 * since results.rows is an HTMLCollectionOf<HTMLTableRowElement>,
 * must use index or iterator to access individual rows,
 * and .innerHTML to check the html value of the table row
 * or .textContent to check the text value of the table row
 *
 *
 */
var index;
var command;
var results;
beforeEach(function () {
    document.body.innerHTML = startHTML;
    main.clearHistory();
    main.initializeGlobalVariables();
    main.prepareKeypress();
    index = 0;
    command = screen.getByTestId('command');
    results = screen.getByTestId('results');
});
function runCommand(prompt) {
    userEvent.type(command, prompt);
    userEvent.keyboard('{enter}');
}
function getCsvRow(filePath, row) {
    var targetCsv = new Array();
    switch (filePath) {
        case 'cats':
            targetCsv = exampleCSVs.cats;
            break;
        case 'stars':
            targetCsv = exampleCSVs.stars;
            break;
        case 'students':
            targetCsv = exampleCSVs.students;
            break;
        case 'burgers':
            targetCsv = exampleCSVs.burgers;
            break;
    }
    return targetCsv[row].join(',').replace(/,/g, '');
}
test('listens to keypress', function () {
    userEvent.type(command, 'test invalid command');
    expect(command.value).toBe('test invalid command');
    userEvent.keyboard('{enter}');
    expect(results.rows[index].innerHTML).toBe("<td>[Error] Command is invalid.</td>");
    expect(results.rows[index].textContent).toBe('[Error] Command is invalid.');
});
test('mode', function () {
    expect(main.isVerboseMode).toBe(false);
    runCommand('mode');
    expect(main.isVerboseMode).toBe(true);
    expect(results.rows[index++].textContent).toBe('Command: mode ');
    expect(results.rows[index++].textContent).toBe('Output: Switched to verbose output mode.');
    runCommand('mode');
    expect(main.isVerboseMode).toBe(false);
    expect(results.rows[index++].textContent).toBe('Switched to brief output mode.');
});
test('load_file', function () {
    expect(main.pathToCsv.size).toBe(0);
    expect(main.isCsvSelected).toBe(false);
    runCommand('load_file');
    expect(main.isCsvSelected).toBe(false);
    expect(results.rows[index++].textContent).toBe('[Error] File path not provided.');
    runCommand('load_file cats');
    expect(main.pathToCsv.size).toBe(1);
    expect(main.pathToCsv.has('cats')).toBe(true);
    expect(main.isCsvSelected).toBe(true);
    expect(main.currentCsvName == 'cats').toBe(true);
    expect(main.currentCsvArray).toBe(exampleCSVs.cats);
    expect(results.rows[index++].textContent).toBe('cats is loaded.');
    runCommand('load_file dogs');
    expect(main.pathToCsv.size).toBe(1);
    expect(main.pathToCsv.has('dogs')).toBe(false);
    expect(main.isCsvSelected).toBe(true);
    expect(main.currentCsvName == 'dogs').toBe(false);
    expect(main.currentCsvArray).toBe(exampleCSVs.cats);
    expect(results.rows[index++].textContent).toBe('[Error] File path is invalid.');
    runCommand('load_file students');
    expect(main.pathToCsv.size).toBe(2);
    expect(main.pathToCsv.has('students')).toBe(true);
    expect(main.isCsvSelected).toBe(true);
    expect(main.currentCsvName == 'students').toBe(true);
    expect(main.currentCsvArray).toBe(exampleCSVs.students);
    expect(results.rows[index++].textContent).toBe('students is loaded.');
    runCommand('load_file burgers');
    expect(main.pathToCsv.size).toBe(3);
    expect(main.pathToCsv.has('burgers')).toBe(true);
    expect(main.isCsvSelected).toBe(true);
    expect(main.currentCsvName == 'burgers').toBe(true);
    expect(main.currentCsvArray).toBe(exampleCSVs.burgers);
    expect(results.rows[index++].textContent).toBe('burgers is loaded.');
    runCommand('load_file stars');
    expect(main.pathToCsv.size).toBe(4);
    expect(main.pathToCsv.has('stars')).toBe(true);
    expect(main.isCsvSelected).toBe(true);
    expect(main.currentCsvName == 'stars').toBe(true);
    expect(main.currentCsvArray).toBe(exampleCSVs.stars);
    expect(results.rows[index++].textContent).toBe('stars is loaded.');
});
test('view', function () {
    runCommand('view');
    expect(results.rows[index++].textContent).toBe('[Error] No csv is selected.');
    runCommand('load_file cats');
    expect(results.rows[index++].textContent).toBe('cats is loaded.');
    runCommand('view');
    expect(results.rows[index++].textContent).toBe('cats displayed.');
    expect(results.rows.length).toBe(index + exampleCSVs.cats.length);
    for (var r = 0; r < exampleCSVs.cats.length; r++) {
        expect(results.rows[index++].textContent).toBe(getCsvRow('cats', r));
    }
    runCommand('load_file stars');
    expect(results.rows[index++].textContent).toBe('stars is loaded.');
    runCommand('view');
    expect(results.rows[index++].textContent).toBe('stars displayed.');
    expect(results.rows.length).toBe(index + exampleCSVs.stars.length);
    for (var r = 0; r < exampleCSVs.stars.length; r++) {
        expect(results.rows[index++].textContent).toBe(getCsvRow('stars', r));
    }
    runCommand('load_file students');
    expect(results.rows[index++].textContent).toBe('students is loaded.');
    runCommand('view');
    expect(results.rows[index++].textContent).toBe('students displayed.');
    expect(results.rows.length).toBe(index + exampleCSVs.students.length);
    for (var r = 0; r < exampleCSVs.students.length; r++) {
        expect(results.rows[index++].textContent).toBe(getCsvRow('students', r));
    }
    runCommand('load_file burgers');
    expect(results.rows[index++].textContent).toBe('burgers is loaded.');
    runCommand('view');
    expect(results.rows[index++].textContent).toBe('burgers displayed.');
    expect(results.rows.length).toBe(index + exampleCSVs.burgers.length);
    for (var r = 0; r < exampleCSVs.burgers.length; r++) {
        expect(results.rows[index++].textContent).toBe(getCsvRow('burgers', r));
    }
});
test('search', function () {
    runCommand('search');
    expect(results.rows[index++].textContent).toBe('[Error] No csv is selected.');
    runCommand('load_file cats');
    expect(results.rows[index++].textContent).toBe('cats is loaded.');
    runCommand('search');
    expect(results.rows[index++].textContent).toBe('[Error] No search term provided.');
    runCommand('search Tom and Jerry');
    expect(results.rows[index++].textContent).toBe('[Error] Too many search terms provided.');
    // only value given
    runCommand('search Father');
    expect(results.rows[index++].textContent).toBe('Results not found.');
    runCommand('search Persian');
    expect(results.rows[index++].textContent).toBe('1 row found in cats.');
    expect(results.rows[index++].textContent).toBe(getCsvRow('cats', 1));
    // both column and value given
    runCommand('search Color Tabby'); // w/ valid column name
    expect(results.rows[index++].textContent).toBe('1 row found in cats.');
    expect(results.rows[index++].textContent).toBe(getCsvRow('cats', 3));
    runCommand('search 2 Tabby'); // w/ valid column index
    expect(results.rows[index++].textContent).toBe('1 row found in cats.');
    expect(results.rows[index++].textContent).toBe(getCsvRow('cats', 3));
    runCommand('search Father Ragdoll'); // w/ invalid column name
    expect(results.rows[index++].textContent).toBe('[Error] Column name not found in header.');
    runCommand('search 1000 Whiskers'); // w/ invalid column index
    expect(results.rows[index++].textContent).toBe('[Error] Column index out of bounds.');
    runCommand('search -1 Whiskers'); // w/ invalid column index
    expect(results.rows[index++].textContent).toBe('[Error] Column index out of bounds.');
    runCommand('search Age Whiskers'); // value in wrong column
    expect(results.rows[index++].textContent).toBe('Results not found.');
});
test('query', function () {
    runCommand('query');
    expect(results.rows[index++].textContent).toBe('[Error] No csv is selected.');
    runCommand('load_file burgers');
    expect(results.rows[index++].textContent).toBe('burgers is loaded.');
    runCommand('query');
    expect(results.rows[index++].textContent).toBe('[Error] This query command is not supported in mocking.');
    expect(results.rows[index++].textContent).toBe('Try the following commands instead');
    index += 2;
    runCommand("query AND('Lettuce, Tomato, Onion, Pickles' in 'Toppings', '900' in Calories')");
    expect(results.rows[index++].textContent).toBe('1 row found in burgers.');
    expect(results.rows[index++].textContent).toBe(getCsvRow('burgers', 1));
});
