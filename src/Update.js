import * as R from 'ramda';

const MSGS = {
  CARD_FORM: "CARD_FORM",
  SAVE_CARD: "SAVE_CARD",
  INPUT_QUESTION: "INPUT_QUESTION",
  INPUT_ANSWER: "INPUT_ANSWER",
  EDIT_CARD: "EDIT_CARD",
  SAVE_EDITED_CARD: "SAVE_EDITED_CARD",
  DELETE_FLASH_CARD: "DELETE_FLASH_CARD",
  SHOW_ANSWER: "SHOW_ANSWER",
  BAD_ANSWER: "BAD_ANSWER",
  GOOD_ANSWER: "GOOD_ANSWER",
  GREAT_ANSWER: "GREAT_ANSWER",
}

export function badAnswerMsg(cardId) {
  return {
    type: MSGS.BAD_ANSWER,
    id: cardId
  }
}

export function goodAnswerMsg(cardId) {
  return {
    type: MSGS.GOOD_ANSWER,
    id: cardId
  }
}

export function greatAnswerMsg(cardId) {
  return {
    type: MSGS.GREAT_ANSWER,
    id: cardId
  }
}

export function cardFormMsg(model) {
  const { currentId } = model
  return {
    type: MSGS.CARD_FORM,
    newCard: {
      "question": "",
		  "answer": "",
		  "id": currentId + 1,
		  "showAnswer": false,
      "edit": true,
      "rank": 0
    }
  }
}

export function saveEditedFashCardMsg(cardId) {
  return {
    type: MSGS.SAVE_EDITED_CARD,
    cardId
  }
}

export function inputQuestionMsg(msg, id) {
  return {
    type: MSGS.INPUT_QUESTION,
    question: msg,
    cardId: id
  }
}

export function inputAnswerMsg(msg, id) {
  return {
    type: MSGS.INPUT_ANSWER,
    answer: msg,
    cardId: id
  }
}

export function editCardMsg(card) {
  return {
    type: MSGS.EDIT_CARD,
    card
  }
}

export function deleteFlashCardMsg(id) {
  return {
    type: MSGS.DELETE_FLASH_CARD,
    id
  }
}

export function showAnswerMsg(id) {
  return {
    type: MSGS.SHOW_ANSWER,
    id
  }
}

function editCards(msg, model) {
  const { card } = msg
  const { flashCards } = model

  const flashCardsMarked = R.map( cardFromArray => {
    if (cardFromArray.id == card.id) {
      return { ...cardFromArray, edit: true }
    } else {
      return { ...cardFromArray }
    }
  }, flashCards) 

  return flashCardsMarked

}

function saveEditedCard(msg, model) {
  const { cardId } = msg
  const { flashCards } = model

  const editedFlashCard = R.map( cardFromArray => {
    if (cardFromArray.id == cardId) {
      return { ...cardFromArray, edit: false, showAnswer: false }
    } else {
      return { ...cardFromArray }
    }
  }, flashCards) 

  return editedFlashCard
}

function removeFlashCard(msg, model){
  const { id } = msg
  const { flashCards } = model

  const newFlashCards = R.filter((flashCard) => {
    if (flashCard.id != id) return true
    else return false
  }, flashCards)

  return newFlashCards
}

function showCardAnswer(msg, model) {
  const { id } = msg
  const { flashCards } = model

  const newFlashCards = R.map((flashCard) => {
    if (flashCard.id == id) {
      return {...flashCard, showAnswer: true}
    } else {
      return flashCard
    }
  }, flashCards)

  return newFlashCards
}

function addFlashCard(msg, model) {
  const { flashCards, currentId } = model
  const { newCard } = msg
  
  const newFlashcards =  [ newCard, ...flashCards ]
  const incrementId = currentId + 1

  return {...model, currentId: incrementId, flashCards: newFlashcards}
}

function inputQuestionFunction(msg, model) {
  const { question, cardId } = msg
  const { flashCards } = model

  const newFlashCards = R.map((flashCard) => {
    if (flashCard.id == cardId) {
      return { ...flashCard, question }
    }
    else {
      return flashCard
    }
  }, flashCards)

  return newFlashCards
}

function inputAnswerFunction(msg, model) {
  const { answer, cardId } = msg
  const { flashCards } = model

  const newFlashCards = R.map((flashCard) => {
    if (flashCard.id == cardId) {
      return { ...flashCard, answer}
    } else {
      return flashCard
    }
  }, flashCards)

  return newFlashCards
}

function gradeQuestion(msg, model, grade) {
  const { id } = msg
  const { flashCards } = model

  const newFlashCards = R.map((flashCard) => {
    if (flashCard.id == id) {
      if (grade != 0) {
        const newRank = flashCard.rank + grade
        return { ...flashCard, rank: newRank, showAnswer: false}
      } else {
        return { ...flashCard, rank: 0, showAnswer: false}
      }

    } else {
      return flashCard
    }
  }, flashCards)

  return sortCards(newFlashCards)
}

function sortCards(flashCards) {

  const rankSort = R.sortWith([
    R.ascend(R.prop('rank'))
  ]);

  return rankSort(flashCards)
}

function update(msg, model) {
  switch(msg.type) {
    case MSGS.CARD_FORM:
      return addFlashCard(msg, model)
    
    case MSGS.SHOW_ANSWER:
      return { ...model, flashCards: showCardAnswer(msg, model) }
    
    case MSGS.DELETE_FLASH_CARD:
      return {...model, flashCards: removeFlashCard(msg, model)}

    case MSGS.EDIT_CARD:

      return { ...model, flashCards: editCards(msg, model) }

    case MSGS.SAVE_EDITED_CARD:
      return { ...model, flashCards: saveEditedCard(msg, model) }

    case MSGS.INPUT_QUESTION:
      return { ...model, flashCards: inputQuestionFunction(msg, model) }

    case MSGS.INPUT_ANSWER:
      return { ...model, flashCards: inputAnswerFunction(msg, model) }

    case MSGS.BAD_ANSWER:
      return { ...model, flashCards: gradeQuestion(msg, model, 0)}

    case MSGS.GOOD_ANSWER:
        return { ...model, flashCards: gradeQuestion(msg, model, 1)}
    
    case MSGS.GREAT_ANSWER:
        return { ...model, flashCards: gradeQuestion(msg, model, 2)}

    case MSGS.SAVE_CARD:
      const { card } = msg
      const { flashCards, currentId } = model
      const newFlashCards = [ ...flashCards, card]

      return { 
        ...model,
        flashCards: newFlashCards,
        question: "",
        answer: "",
        currentId: currentId + 1,
        add: false
      }
  }
  return model;
}

export default update;
