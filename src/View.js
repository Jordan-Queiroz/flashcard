import * as R from 'ramda';
import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import {
  cardFormMsg,
  inputQuestionMsg,
  inputAnswerMsg,
  editCardMsg,
  saveEditedFashCardMsg,
  deleteFlashCardMsg,
  showAnswerMsg,
  badAnswerMsg,
  goodAnswerMsg,
  greatAnswerMsg
} from './Update'

const { div, h1, pre, button, i, p, textarea, a } = hh(h);

function textBox(label, value, oninput) {
  return div({className: ""}, [
    p({className: "b f6 mv1"}, label),
    textarea({className: "w-100 bg-washed-yellow outline-0", oninput, value})
  ])
}

function questionSide(dispatch, label, card) {
  const { question, id } = card
  return div({className: ""}, [
    div({className: "b f6 mv1 underline"}, label),
    div({className: "pointer", onclick: () => dispatch(editCardMsg(card))}, question),
    a({className: "f6 underline link pointer", onclick: () => dispatch(showAnswerMsg(id))}, "Show Answer")
  ])
}

function answerSide(dispatch, card) {
  const { question, answer } = card
  return div({className: ""}, [
    div({className: "b f6 mv1 underline"}, "Question"),
    div({className: "pointer", onclick: () => dispatch(editCardMsg(card))}, question),
    div({className: "b f6 mv1 underline"}, "Answer"),
    div({className: "pointer", onclick: () => dispatch(editCardMsg(card))}, answer),
    div({className: "mv2 flex justify-between"}, selfGrade(dispatch, card))
  ])
}

function selfGrade(dispatch, card) {
  const gradeButtons = [
    {
      "grade": "Bad",
      "f": badAnswerMsg,
      "buttonClass": "f4 ph3 pv2 bg-red bn white br1"
    },
    {
      "grade": "Good",
      "f": goodAnswerMsg,
      "buttonClass": "f4 ph3 pv2 bg-blue bn white br1"
    },
    {
      "grade": "Great",
      "f": greatAnswerMsg,
      "buttonClass": "f4 ph3 pv2 bg-dark-green bn white br1"
    }
  ]

  const gradeButtonsView = R.map(button => {
    const { id } = card
    const { grade, f, buttonClass} = button

    return formButton(dispatch, id, f, buttonClass, grade)
  },gradeButtons)

  return gradeButtonsView
}

function flashCardForm(dispatch, data, f) {

  const { question, answer, id } = data
  return div({className: "w-third pa2"}, [
    div({className: "w-100 pa2 bg-light-yellow mv2 shadow-1 relative"}, [
      textBox("Question", question, e => dispatch(inputQuestionMsg(e.target.value, id))),
      textBox("Answer", answer, e => dispatch(inputAnswerMsg(e.target.value, id))),
      formButton(dispatch, id, f, 
        'f4 ph3 pv2 br1 bg-gray bn white mv2',
        'Save'),
      i({
        className: "absolute top-0 right-0 fa fa-remove fa-fw black-50 pointer",
        onclick: () => dispatch(deleteFlashCardMsg(id))  
      }),
    ])
  ])
}

function formButton(dispatch, cardId, f, className, label) {
  return button(
  {
    className,
    onclick: () => dispatch(f(cardId))
  }, 
  [
    label
  ])
}

function addFlashCardButton(dispatch, model) {
  return div({className: ""}, [
    button(
      {
        className: "pa2 br1 mv2 bg-green bn white",
        onclick: () => dispatch(cardFormMsg(model))  
      }, 
      [
        i({className: "ph1 fa fa-plus"}),
        'Add Flashcard',
      ])
  ])

}

function showAnswerFunction(dispatch, card) {
  const { id } = card

  return div({className: "w-third pa2"}, [
    div({className: "w-100 pa2 bg-light-yellow mv2 shadow-1 relative"}, [
      answerSide(dispatch, card),
      i(
        {
          className: "absolute top-0 right-0 fa fa-remove fa-fw black-50 pointer",
          onclick: () => dispatch(deleteFlashCardMsg(id))
        }),
    ])
  ])
}

const flashCardsViewFunction = R.curry(
  (dispatch, card) => {
    const { question, answer, showAnswer, edit, id } = card
  
  if (edit) {
    return flashCardForm(dispatch, card, saveEditedFashCardMsg)
  } else if (showAnswer) {
    return showAnswerFunction(dispatch, card)
  }
  else {
    return div({className: "w-third pa2"}, [
      div({className: "w-100 pa2 bg-light-yellow mv2 shadow-1 relative"}, [
        questionSide(dispatch, "Question", card),
        i(
          {
            className: "absolute top-0 right-0 fa fa-remove fa-fw black-50 pointer",
            onclick: () => dispatch(deleteFlashCardMsg(id))
          }),
      ])
    ])
  }
  }
)

function showFlashCards(dispatch, model) {

  const { flashCards } = model

  const flashCardsWitchDispatch = flashCardsViewFunction(dispatch)

  const flashCardsView = flashCards.map(flashCardsWitchDispatch)

  return flashCardsView
}

function view(dispatch, model) {
  return div({ className: 'mw8 center' }, [
    h1({ className: 'f2 pv2 bb' }, 'Flashcard Study'),
    addFlashCardButton(dispatch, model),
    div({className: "flex flex-wrap nl2 nr2"},
      showFlashCards(dispatch, model)
    ),
    pre(JSON.stringify(model, null, 2)),
  ]);
}

export default view;
