import * as exampleCSVs from './mockedJson.js'

/**
 * Global state variables to access and manage states.
 */
let currentCsvName: string
let currentCsvArray: string[][]
let isCsvSelected: boolean
let isVerboseMode: boolean

/**
 * Global variables to print results in html table and to map filePath to csvArray.
 */
let replResults: HTMLElement | null
let pathToCsv: Map<string, string[][]>

/**
 * Script to prepare keypress listeners.
 */
window.onload = () => {
  initializeGlobalVariables()
  prepareKeypress()
}

/**
 * @description
 * READ THIS BEFORE MOVING FORWARD
 *
 *  Functions are declared by order of hierachy, i.e. the order they are called,
 *  hence dependant functions come before the functions they depend on.
 *  Read from top to bottom as the code moves
 *  from high level functions to low level functions.
 */

function initializeGlobalVariables() {
  currentCsvName = ''
  currentCsvArray = new Array()
  isCsvSelected = false
  isVerboseMode = false
  replResults = document.getElementById('repl-results')
  pathToCsv = new Map<string, string[][]>()
}

/**
 * Script to activate keypress listeners.
 */
function prepareKeypress() {
  const maybeInputs: HTMLCollectionOf<Element> =
    document.getElementsByClassName('repl-command-box')
  const maybeInput: Element | null = maybeInputs.item(0)
  if (maybeInput == null) {
    console.log('[Error] Failed to find html repl-command-box element.')
  } else if (!(maybeInput instanceof HTMLInputElement)) {
    console.log(`[Error] Found element ${maybeInput}, but it wasn't an input`)
  } else {
    maybeInput.addEventListener('keypress', handleKeypress)
  }
}

/**
 * Implements REPL functionalities that takes command from html input and prints results in html table.
 */
function handleKeypress(event: KeyboardEvent) {
  // skip execution if input command (html input) is empty
  if (event.key != 'Enter') {
    return
  }
  // skip execution if unable to access repl-history (html table element)
  if (replResults == null) {
    console.log('[Error] Failed to find html table element.')
    return
  }
  // reads the input command from html input
  const command: string = readCommand()
  // evaluate results based on command types
  const results = evaluateCommand(command)
  // print results in repl-hisotry (html table element)
  printResults(command, results)
  // reset input command (html input) to empty
  resetCommand()
}

/**
 * Reads the command string from html input.
 *
 * @returns string: the command string to be evaluated
 */
function readCommand() {
  let command: string = ''
  const maybeInput: Element | null = document
    .getElementsByClassName('repl-command-box')
    .item(0)
  if (maybeInput != null && maybeInput instanceof HTMLInputElement) {
    command = maybeInput.value
  }
  return command
}

/**
 * Evaluates the command based on commandType and returns the results.
 *
 * @param command
 * @returns string[]: the results array to be printed
 */
function evaluateCommand(command: string) {
  // if input command is empty, skip following evaluations and returns empty results
  if (command == '') {
    return []
  }
  let results: string[] = new Array()
  let outputPrompt: string = isVerboseMode ? 'Output: ' : ''
  const commandTerms: string[] = command.split(' ')
  const commandType: string = commandTerms[0]
  switch (commandType) {
    case 'mode':
      results = runModeCommand()
      break
    case 'load_file':
      results = runLoadFileCommand(commandTerms, outputPrompt)
      break
    case 'view':
      results = runViewCommand(outputPrompt)
      break
    case 'search':
      results = runSearchCommand(commandTerms, outputPrompt)
      break
    case 'query':
      results = runQueryCommand(command.slice(6), outputPrompt)
      break
    default:
      results = getOutputMessage(outputPrompt, '[Error] Command is invalid.')
      break
  }
  return results
}

/**
 * Prints the results from evaluateCommand().
 *
 * @param command - the command to be printed in verbose mode
 * @param results - the results to be printed in html table,
 *                  consists of messages and or csv rows in html tr format
 */
function printResults(command: string, results: string[]) {
  if (replResults == null) {
    console.log('[Error] Failed to find html table element.')
    return
  }
  if (isVerboseMode) {
    replResults.innerHTML += `<tr class='outputMode'><td>Command: ${command} </td></tr>`
  }
  // prints the results by appending each tr to repl-history
  results.forEach((row) => {
    if (replResults == null) {
      console.log('[Error] Failed to find html table element.')
      return
    }
    replResults.innerHTML += row
  })
}

/**
 * Resets the input command to empty.
 */
function resetCommand() {
  const maybeInput: Element | null = document
    .getElementsByClassName('repl-command-box')
    .item(0)
  if (maybeInput != null && maybeInput instanceof HTMLInputElement) {
    maybeInput.value = ''
  }
}

/**
 * Runs the mode command.
 *
 * @returns string[]: the mode change message nested in a list
 */
function runModeCommand() {
  isVerboseMode = !isVerboseMode
  const outputPrompt: string = isVerboseMode ? 'Output: ' : ''
  const outputMode: string = isVerboseMode ? 'verbose' : 'brief'
  return getOutputMessage(outputPrompt, `Switched to ${outputMode} output mode.`)
}

/**
 * Runs the load_file command.
 *
 * @param commandTerms - a list of comm
 * @param outputPrompt
 * @returns string[]: the load_file message or relevant error messages nested in a list
 */
function runLoadFileCommand(commandTerms: string[], outputPrompt: string) {
  if (commandTerms.length < 2) {
    return getOutputMessage(outputPrompt, '[Error] File path not provided.')
  }
  const filePath: string = commandTerms[1]
  if (!(filePath in exampleCSVs)) {
    return getOutputMessage(outputPrompt, '[Error] File path is invalid.')
  }
  if (!pathToCsv.has(filePath)) {
    setPathToCsv(filePath)
  }
  const newCsvArray = pathToCsv.get(filePath)
  if (!newCsvArray) {
    return getOutputMessage(outputPrompt, '[Error] csv is corrupted.')
  }
  currentCsvArray = newCsvArray
  currentCsvName = filePath
  isCsvSelected = true
  return getOutputMessage(outputPrompt, `${filePath} is loaded.`)
}

/**
 * Runs the view command.
 *
 * @param outputPrompt - the ouputPrompt for verbose mode
 * @returns string[]: the view message and the csv array,
 *                    or relevant error messages,
 *                    wrapped in a string array
 */
function runViewCommand(outputPrompt: string) {
  if (!isCsvSelected) {
    return getOutputMessage(outputPrompt, '[Error] No csv is selected.')
  }
  const outputMessage: string[] = getOutputMessage(
    outputPrompt,
    `${currentCsvName} displayed.`
  )
  const outputArray: string[] = getCsvArrayInHtmlTable(currentCsvArray)
  return outputMessage.concat(outputArray)
}

/**
 * Runs the search command.
 *
 * @param commandTerms - the list of command arguments
 * @param outputPrompt - the outputPrompt used for verbose ouput
 * @returns string[]: the sarch message and the result csv rows,
 *                    or relevant error messages,
 *                    wrapped in a string array
 */
function runSearchCommand(commandTerms: string[], outputPrompt: string) {
  if (!isCsvSelected) {
    return getOutputMessage(outputPrompt, '[Error] No csv is selected.')
  }
  if (commandTerms.length == 1) {
    return getOutputMessage(outputPrompt, '[Error] No search term provided.')
  }
  if (commandTerms.length > 3) {
    return getOutputMessage(outputPrompt, '[Error] Too many search terms provided.')
  }
  // take care of edge case where column is not provided
  const columnInput: string = commandTerms.length == 3 ? commandTerms[1] : 'anyColumn'
  const value: string = commandTerms.length == 3 ? commandTerms[2] : commandTerms[1]
  // determine if column input is name or index
  const columnInputIsName: boolean = isNaN(Number(columnInput))
  // convert column input to index number
  const columnIndex: number = columnInputIsName
    ? currentCsvArray[0].indexOf(columnInput)
    : Number(columnInput)
  // returns error messages and skips following execution if error condition is satisfied.
  if (
    columnInputIsName &&
    columnInput != 'anyColumn' &&
    !currentCsvArray[0].includes(columnInput)
  ) {
    return getOutputMessage(outputPrompt, '[Error] Column name not found in header.')
  }
  if (
    !columnInputIsName &&
    (columnIndex <= -1 || columnIndex >= currentCsvArray[0].length)
  ) {
    return getOutputMessage(outputPrompt, '[Error] Column index out of bounds.')
  }
  const outputRows: string[][] = searchCsv(value, columnIndex)
  if (outputRows.length == 0) {
    return getOutputMessage(outputPrompt, 'Results not found.')
  }
  const outputMessage: string[] = getOutputMessage(
    outputPrompt,
    `${outputRows.length} ${
      outputRows.length == 1 ? 'row' : 'rows'
    } found in ${currentCsvName}.`
  )
  return outputMessage.concat(getCsvArrayInHtmlTable(outputRows))
}

/**
 * Runs the query command. [Mocking] [hard-coded]
 *
 * @param query - the query arguments to be parsed and recursively searched
 * @param outputPrompt - the outputPrompt used for verbose ouput
 * @returns string[]: the query message and the result csv rows,
 *                    or relevant error messages,
 *                    wrapped in a string array
 */
function runQueryCommand(query: string, outputPrompt: string) {
  if (!isCsvSelected) {
    return getOutputMessage(outputPrompt, '[Error] No csv is selected.')
  }
  const exampleQuery: string = `AND('Lettuce, Tomato, Onion, Pickles' in 'Toppings', '900' in Calories')`
  if (currentCsvName == 'burgers' && query == exampleQuery) {
    // hard-coded ouput message
    const outputMessage: string[] = getOutputMessage(
      outputPrompt,
      '1 row found in burgers.'
    )
    // hard-coded output rows
    const outputRows: string[][] = [exampleCSVs.burgers[1]]
    return outputMessage.concat(getCsvArrayInHtmlTable(outputRows))
  }
  const errorMessages: string[] = new Array()
  errorMessages.push(
    getOutputMessage(
      outputPrompt,
      '[Error] This query command is not supported in mocking.'
    )[0]
  )
  // suggests hard-coded command prompts for mocking and testing.
  errorMessages.push(getOutputMessage('', 'Try the following commands instead')[0])
  errorMessages.push(getOutputMessage('', `load_file burgers`)[0])
  errorMessages.push(getOutputMessage('', `query ${query}`)[0])
  return errorMessages
}

/**
 * Maps new filepath to csvArray. [Mocking] [hard-coded]
 *
 * @param filePath - used as the key in pathToCsv map
 */
function setPathToCsv(filePath: string) {
  switch (filePath) {
    case 'students':
      pathToCsv.set(filePath, exampleCSVs.students)
      break
    case 'burgers':
      pathToCsv.set(filePath, exampleCSVs.burgers)
      break
    case 'cats':
      pathToCsv.set(filePath, exampleCSVs.cats)
      break
    case 'stars':
      pathToCsv.set(filePath, exampleCSVs.stars)
      break
  }
}

/**
 * Converts the intputArray from 2d string array to a 1d string array of html tr.
 *
 * @param inputArray - the array to be converted
 * @returns string[]: the input array in a list of html tr
 */
function getCsvArrayInHtmlTable(inputArray: string[][]) {
  const htmlTableRows: string[] = new Array()
  const numRows: number = inputArray.length
  if (numRows == 0) {
    return htmlTableRows
  }
  const numCols: number = inputArray[0].length
  for (let r = 0; r < numRows; r++) {
    let row: string = ''
    for (let c = 0; c < numCols; c++) {
      row += `<td>${inputArray[r][c]}</td>`
    }
    htmlTableRows.push("<tr class='userData'>" + row + '</tr>')
  }
  return htmlTableRows
}

/**
 * Searches the target value in currentCsvArray.
 *
 * @param value - the target value to be searched
 * @param columnIndex - the column index to be searched
 *                      -1 if searching all columns
 * @returns string[][]: a list of qualified rows
 */
function searchCsv(value: string, columnIndex: number): string[][] {
  const rows: string[][] = new Array()
  if (columnIndex == -1) {
    // searching in all columns
    for (let r = 0; r < currentCsvArray.length; r++) {
      if (currentCsvArray[r].includes(value)) {
        rows.push(currentCsvArray[r])
      }
    }
  } else {
    // searching in designated column
    for (let r = 0; r < currentCsvArray.length; r++) {
      if (currentCsvArray[r][columnIndex] == value) {
        rows.push(currentCsvArray[r])
      }
    }
  }
  return rows
}

/**
 * Gets the output message in html tr format.
 *
 * @param prompt - the prompt of the message
 * @param content - the content of the message
 * @returns string[]: the outputMessage nested in a string array
 */
function getOutputMessage(prompt: string, content: string) {
  return [`<tr class='message'><td>${prompt}${content}</td></tr>`]
}

/**
 * Resets the command and results.
 */
function clearHistory() {
  const commandBox: Element | null = document
    .getElementsByClassName('repl-command-box')
    .item(0)
  if (commandBox != null && commandBox instanceof HTMLInputElement) {
    commandBox.value = ''
  }
  const resultsTable: Element | null = document.getElementById('repl-results')
  if (resultsTable != null && resultsTable instanceof HTMLElement) {
    resultsTable.innerHTML = ''
  }
  // initializeGlobalVariables()
}

export {
  pathToCsv,
  isVerboseMode,
  isCsvSelected,
  currentCsvName,
  currentCsvArray,
  prepareKeypress,
  handleKeypress,
  readCommand,
  evaluateCommand,
  printResults,
  resetCommand,
  runModeCommand,
  runLoadFileCommand,
  runViewCommand,
  runSearchCommand,
  runQueryCommand,
  setPathToCsv,
  getCsvArrayInHtmlTable,
  searchCsv,
  getOutputMessage,
  clearHistory,
  initializeGlobalVariables,
}
