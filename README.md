## Project Details

- ### Project name: Echo
- ### Team members
  - James Li (sli64, total 20hrs productive + 5hrs frustration)
  - Xingyu Liu (xliu205, total 14hrs productive + 7hrs frustration)
- ### Contributions
  - Structure and Design (james, 1hrs)
  - Basic framework (james, 2hrs)
    - mockedJson
    - readCommand
    - evaluateCommand
    - printResults
  - Functionalities (james, 5hrs)
    - checking input arguments for different use cases
    - mapping file path and csv array
    - geting html tr format results
    - initializing/resetting global states and variables
    - toggling mode
    - loading csv (Xingyu, 3hrs)
    - viewing table
    - searching csv array (Xingyu, 3hrs)
  - Debugging (james, 3hrs)
  - Frustration with DOM LOL (james, 5hrs) (Xingyu, 4hrs)
  - Frustration with search argument handling (Xingyu, 3hrs)
  - Refactoring, denesting, decoupling (james, 3hrs)
  - Documentation (james, 2hrs)
  - Unit testing (Xingyu, 5hrs)
  - Dom testing (james, 4hrs)
- ### [Link to repo](https://github.com/cs0320-s2023/sprint-2-sli64-xliu205.git)

## Design choices

- ### Hierachical Overview
  - window.onload
    - initializeGlobalVariables
    - prepareKeypress -> handleKeypress
      - readCommand
      - evaluateCommand
        - runModeCommand
          - getOutputMessage
        - runLoadFileCommand
          - setPathToCsv
          - getOutputMessage
        - runViewCommand
          - getCsvArrayInHtmlTable
          - getOutputMessage
        - runSearchCommand
          - searchCsv
          - getCsvArrayInHtmlTable
          - getOutputMessage
        - runQueryCommand
          - getOutputMessage
      - printResults
      - resetCommand
- ### Project workflow
  - designed global states and variables
  - ignored nesting and coupling issues
  - flushed out basic functionalities
  - implemented all functionalities
  - refactored, denested and decoupled code
  - wrote documentation
  - wrote unit testing
  - wrote dom testing
- ### Arguments handling
  - uses `query` to take care of composite/recursive searches
  - uses strict requirement for argument parsing, i.e. if column index out of bounds or not found in header, print error message in results
- ### Command running
  - uses 'Enter' keypress instead of button for ease of use

## Errors/Bugs

- none remaining bugs
- assumes header row of csvFile is not number, i.e. $[[5,4,3,2,1],['a','b','c','d',e']]$ would mess up column indexing

## Tests

- main.dom.test
  - conducts dom testing by checking the command box and results table for correct edge case handling and results displaying after typing command input and pressing enter
  - all 6 tests passed (87 expects total)
- main.test
  - conducts other unit testing by checking functions directly from main.ts
  - all 8 tests passed (8 expects total)

## UserStories and Intructions

- ### User Story 5
  - Carefully read the documentation in `main.ts`, every variable and function has been clearly documented with what it does, how it is used, what it take in and what it spits out
  - Carefully read the documentation in `main.dom.test.ts`, clear instructions have been given to enable developers to write future tests
  - Make your changes in `.ts` file and run `npx tsc` (it transpiles typescript files to javascript files) everytime before checking the browser
  - Use `npm test` to run your test, remember to `npx tsc` as well before running the test,
- ### Other User Stories
  - Open VSCode and go to root directory of the project
  - Right click on `index.html` and select `Open with Live Server`
  - Move to the html page rendered in your browser
  - Click on the command box where it says `Type in command here. Press ENTER to run the command.`
  - Type in your desired command and hit Enter key on your keyboard
  - note for supplemental component, use `query` as the command word
