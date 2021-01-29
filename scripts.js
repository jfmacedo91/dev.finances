const Modal = {
  modalOverlay: document.querySelector('.modal-overlay'),
  open() {
    Modal.modalOverlay.classList.add('active')
  },
  close() {
    Modal.modalOverlay.classList.remove('active')
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
  },
  set(transactions) {
    localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),
  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },
  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload()
  },
  incomes() {
    let incomes = 0
    Transaction.all.forEach(transaction => {
      if(transaction.amount > 0) {
        incomes += transaction.amount
      }
    })
    return incomes
  },
  expenses() {
    let expenses = 0
    Transaction.all.forEach(transaction => {
      if(transaction.amount < 0) {
        expenses += transaction.amount
      }
    })
    return expenses
  },
  total() {
    return Transaction.incomes() + Transaction.expenses()
  }
}

const DOM = {
  transactionsContainer: document.querySelector('tbody'),
  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTrnasaction(transaction, index)
    tr.dataset.index = index
    DOM.transactionsContainer.appendChild(tr)
  },
  innerHTMLTrnasaction(transaction, index) {
    const CSSClass = transaction.amount < 0 ? 'expense' : 'income'
    const amount = Utils.formatCurrency(transaction.amount)
    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSClass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="Remover transação">
      </td>
    `

    return html
  },
  updateBalance() {
    document
      .querySelector('#incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .querySelector('#expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .querySelector('#totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())

    const totalCard = document.querySelector('.card.total')
    if(Transaction.total() == 0) {
      totalCard.classList.remove('negative')
      totalCard.classList.remove('positive')
    } else if(Transaction.total() < 0) {
      totalCard.classList.remove('positive')
      totalCard.classList.add('negative')
    } else {
      totalCard.classList.remove('negative')
      totalCard.classList.add('positive')
    }
  },
  clearTranastions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100

    return value
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')
    value = Number(value) / 100
    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value
  },
  formatDate(date) {
    const splitedDate = date.split('-')

    return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },
  validateFields() {
    const { description, amount, date } = Form.getValues()
    
    if(
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Por favor, preencha todos os campos!')
    }
  },
  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)
    
    return {
      description,
      amount,
      date
    }
  },
  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },
  submit(event) {
    event.preventDefault()
    try {
      Form.validateFields()
      const transaction = Form.formatValues()
      Transaction.add(transaction)
      Form.clearFields()
      Modal.close()
    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction)
    
    DOM.updateBalance()

    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTranastions()
    App.init()
  },
}

App.init()