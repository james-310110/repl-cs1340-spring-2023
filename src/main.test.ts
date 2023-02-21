import * as main from './main'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import * as mock from './mockedJson.js'

const startHTML = `
  <div class="repl">
      <!-- To hold the command history -->
      <div class="repl-history">
        <table>
          <thead></thead>
          <tbody id="repl-results" data-testid="results" />
        </table>
      </div>
      <hr />
      <!-- To hold the command input box -->
      <div class="repl-input">
        <input
          type="text"
          class="repl-command-box"
          placeholder="Type in command here. Press ENTER to run the command."
          data-testid="command"
        />
      </div>
    </div>
    <!-- Load the script! Note: the .js extension is because browsers don't use TypeScript
    directly. Instead, the author of the site needs to compile the TypeScript to JavaScript. -->
    <script type="module" src="../src/main.js"></script>
`

beforeEach(function () {
  document.body.innerHTML = startHTML
  main.clearHistory()
  main.initializeGlobalVariables()
  main.prepareKeypress()
})

// search on an unloaded file
test('search CSV with no file loaded', () => {
  expect(
    main.runSearchCommand(['search', 'Name', 'Tiger'], 'outputPrompt')
  ).toStrictEqual([
    "<tr class='message'><td>outputPrompt[Error] No csv is selected.</td></tr>",
  ])
})

// search non-existent column
test('search non-existent column', () => {
  expect(main.runSearchCommand(['search', 'Name', 'boot'], 'outputPrompt')).toStrictEqual(
    ["<tr class='message'><td>outputPrompt[Error] No csv is selected.</td></tr>"]
  )
})

// search CSV and print results
test('search CSV with numbers', () => {
  main.runLoadFileCommand(['load_file', 'cats'], 'outputPrompt')
  expect(main.runSearchCommand(['search', 'Age', '2'], 'outputPrompt')).toStrictEqual([
    "<tr class='message'><td>outputPrompt1 row found in cats.</td></tr>",
    "<tr class='userData'><td>Fluffy</td><td>2</td><td>White</td><td>Persian</td><td>Playful and curious</td></tr>",
  ])
})

// search CSV with no inputs
test('search CSV with no arguments', () => {
  main.runLoadFileCommand(['load_file', 'cats'], 'outputPrompt')
  expect(main.runSearchCommand(['search'], 'outputPrompt')).toStrictEqual([
    "<tr class='message'><td>outputPrompt[Error] No search term provided.</td></tr>",
  ])
})
// search CSV with too many inputs
test('search CSV with too many inputs', () => {
  main.runLoadFileCommand(['load_file', 'cats'], 'outputPrompt')
  expect(main.runSearchCommand(['search', 'i', 'o', 'p'], 'outputPrompt')).toStrictEqual([
    "<tr class='message'><td>outputPrompt[Error] Too many search terms provided.</td></tr>",
  ])
})
// search column index out of range
test('search column index out of range', () => {
  main.runLoadFileCommand(['load_file', 'cats'], 'outputPrompt')
  expect(main.runSearchCommand(['search', '10', 'Tiger'], 'outputPrompt')).toStrictEqual([
    "<tr class='message'><td>outputPrompt[Error] Column index out of bounds.</td></tr>",
  ])
})

// set file Path To CSV
test('setPathToCsv', () => {
  main.setPathToCsv(`cats`)
  expect(main.getOutputMessage(``, `cats is loaded.`)).toStrictEqual([
    "<tr class='message'><td>cats is loaded.</td></tr>",
  ])
})

// get output message
test('getOutputMessage', () => {
  expect(main.getOutputMessage('prompt', 'content')).toStrictEqual([
    "<tr class='message'><td>promptcontent</td></tr>",
  ])
})
