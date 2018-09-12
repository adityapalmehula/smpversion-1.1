module.exports= {
  QUESTION_LEVELS: ['Basic','Intermediate','Expert'],
  QUESTION_TYPE: ['Single Choice','Multiple Choice','True/False'],
  FILE_SIZE:[128000,5242880,256000,5242880,1024000],
  FOLDER_NAME:['profiles','media','courses','textbooksolutions','helps','projects', 'programs'],
  SUBSCRIPTION_DAYS: 30,

  QUESTION_LEVELS_MARKS: [2,4,6],
  MAX_ATTEMPTS: ['Infinite','1','2','3','4','5','6','7','8'],
  DEFAULT_PASS_PERCENTAGE: 60,
  SHOW_FEEDBACK_AT: [
  `At end of test`,
  `Self-evaluation (immediate feedback)`,
  `Exam (no feedback)`
  ],
  SHOW_SCORE_AT: [
  `Auto-evaluation mode: show score and expected answers`,
  `Exam mode: Do not show score nor answers`,
  `Practice mode: Show score only, by category if at least one is used`,
  `Show score on every attempt, show correct answers only on last attempt (only works with an attempts limit)`
  ],
  SHUFFLE_ANSWERS: [
  `Yes`,
  `No`
  ],
  INSTRUCTIONS_AT_START: `
  <ol>
  <li><p>Select an answer for every question. Unanswered questions will be scored as incorrect.</p></li>
  <li><p>There are three possible question types:</p>If you want to try to 
  <ul>
  <li><p><strong>Multiple Choice</strong>: click the radio button to indicate your choice. Currently, only one answer can be selected for a multiple choice question.</p>
  </li><li><p><strong>True/False</strong>: click the radio button to indicate your choice.</p></li>
  <li><p><strong>Matching Answers</strong>: select a match from the pop-up list below each item.</p></li>
  <li><p>If you use a wheel button mouse, take care not to accidently change your answers. Sometimes scrolling the wheel will rotate through the answers in a selection list, when you might have meant simply to scroll farther down in the quiz window.</p></li>
  </ul></li>
  <li><p>Click on the&nbsp;<strong>Submit</strong>&nbsp;button at the bottom of the page to have your answers graded.</p></li>
  <li><p>You will be shown your results, including your score and any feedback offered by the author of the quiz. You might wish to print this page for your own records. At this stage, you might be able to check your answers: see below.</p></li>
  <li><p>If you want to try to get a better score, click the&nbsp;<strong>Try Again</strong>&nbsp;button at the bottom of the results page. You can try the quiz as many times as you like.</p></li>
  </ol>
  `,
  INSTRUCTIONS_AT_THE_END: `
  <ol>
  <li>
  <p>Depending on how the quiz is configured, you might be allowed to check your answers.</p>
  </li>
  <li><p>Click on the&nbsp;<strong>Check Answers</strong>&nbsp;button at the bottom of the results page. A new browser window will open. (If you do not see the "Check Answers" button, it means that you are not allowed to check your answers for that quiz.)</p></li>
  <li><p>Each question is preceded by the word "correct" or "incorrect", and the answer you gave is shown.</p></li>
  <li><p>The author of the quiz may have helpful comments for each question. Be sure to check for this feedback.</p></li>
  <li><p>Close this browser window when you are done checking your answers.</p>
  </li>
  </ol>
  `,
}