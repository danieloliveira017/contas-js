const Modal = {
  open() {
    document.querySelector('.modal-overlay').classList.add('active');
  },
  close() {
    document.querySelector('.modal-overlay').classList.remove('active');
  },
  openF() {
    document.querySelector('modal-filtro').classList.add('ativo');
  },
  closeF() {
    document.querySelector('modal-filtro').classList.remove('ativo');
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finaces:transactions')) || [];
  },
  set(transaction) {
    localStorage.setItem(
      'dev.finaces:transactions',
      JSON.stringify(transaction),
    );
  },
};

const transacao = {
  all: Storage.get(),

  add(transaction, index) {
    transacao.all.push(transaction, index);
    console.log(index)
    App.reload();
  },
  remove(index) {
    transacao.all.splice(index, 1);

    App.reload(index);
  },
  entradas() {
    // somas das entradas

    let incomes = 0;

    transacao.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        incomes += transaction.amount;
      }
    });
    //console.log(incomes);

    return incomes;
  },
  saidas() {
    //somas das saídas

    let saida = 0;

    transacao.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        saida += transaction.amount;
      }
    });
    //console.log(saida);
    return saida;
  },
  saldo() {
    // totalizando

    let total = transacao.all;

    total = transacao.entradas() + transacao.saidas();

    return total;
  },
  filtroE() {
    let div = (document.getElementById('result').innerHTML = '');
    const amounts = transacao.all.filter(Filter.Entrada);

    return amounts;
  },
  filtroS() {
    let div = (document.getElementById('result').innerHTML = '');
    const amounts = transacao.all.filter(Filter.Saida);

    return amounts;
  },
};

const DOM = {
  transactionContainer: document.querySelector('#data-table tbody'),

  // tabelas do site
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense';
    const amount = Utils.formatCurrency(transaction.amount); //transforma em real

    const html = `
          <td class="description">${transaction.description}</td>
          <td class="${CSSclass}">${amount}</td>
          <td class="date">${transaction.date}</td>
          <td>
              <img onclick="transacao.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
          </td>
          
          
          `;
    // console.log();

    return html;
  },

  // organização da tabela de resultados
  addTransactions(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    DOM.transactionContainer.appendChild(tr);
    //console.log(index);
  },

  // dom da entradas dos cards
  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(
      transacao.entradas(),
    );
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(
      transacao.saidas(),
    );
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(
      transacao.saldo(),
    );
  },

  clearTransactions() {
    DOM.transactionContainer.innerHTML = '';
  },
};

const Filter = {
  div: document.getElementById('result'),
  Entrada(index) {
    if (index.amount > 0) {
      Filter.div.innerHTML += `
    
        <div class="tabela">
            <p>${index.description} (+)</p>
            <p>${Utils.formatCurrency(index.amount)}</p>
            <p>${index.date}</p>
        </div>

        `;
      console.log(index.amount);
    }
    return index;
  },
  Saida(index) {
    if (index.amount < 0) {
      Filter.div.innerHTML += `
        <div class="tabela">
            <p>${index.description} (-)</p>
            <p>${Utils.formatCurrency(index.amount)}</p>
            <p>${index.date}</p>
        </div>

        `;
      console.log(index.amount);
    }
    return index;
  },
};
const Utils = {
  //formatar o numeros em Reais
  // Utils.formatCurrency();
  formatAmount(value) {
    value = Number(value.replace(/\,\./g, '')) * 100;

    return value;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : '';
    value = String(value).replace(/\D/g, '');
    value = Number(value) / 100;
    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    //console.log(signal + value);
    return signal + value;
  },
  formatDate(date) {
    const splittedDate = date.split('-');
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
};

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValue() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateFields() {
    const { description, amount, date } = Form.getValue();
    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Por favor, preencher todos os campos');
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValue();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },
  clearFilds() {
    Form.description.value = '';
    Form.amount.value = '';
    Form.date.value = '';
  },
  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      transacao.add(transaction);
      Form.clearFilds();
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    transacao.all.forEach((transaction, index) => {
      DOM.addTransactions(transaction, index);
      DOM.updateBalance(transaction);
      Storage.set(transacao.all);
    });
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};
App.init();
