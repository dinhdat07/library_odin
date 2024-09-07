const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const form = $('#new-book-form');
const addBoard = $('#add-board');
const board = $('#new-book');
const container = $('#book-container');


const app = {
    renderBooks: async function () {
        const response = await fetch('/books');
        const books = await response.json();

        container.innerHTML = "";
        container.appendChild(addBoard);
        container.appendChild(board);

        books.forEach(({ _id, title, author, info, read }) => {
            const book = document.createElement("div");
            book.classList.add("book");
            book.innerHTML = `
                <div class="title">${title}</div>
                <div class="author">${author}</div>
                <div class="info">${info}</div>
                <i class="material-icons delete-icon" data-id="${_id}">delete</i>
                <i class="material-icons edit-icon" data-id="${_id}">edit</i>
                <i class="material-icons check-icon ${read ? 'read' : ''}" data-id="${_id}">check</i>
            `;
            container.appendChild(book);
        });

        this.addEventListeners();
    },

    addEventListeners: function() {
        $$('.delete-icon').forEach(icon => {
            icon.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this book?')) {
                    await fetch(`/books/${icon.dataset.id}`, { method: 'DELETE' });
                    this.renderBooks();
                }
            });
        });

        $$('.edit-icon').forEach(icon => {
            icon.addEventListener('click', () => this.editBook(icon.dataset.id));
        });

        $$('.check-icon').forEach(icon => {
            icon.addEventListener('click', async () => {
                const response = await fetch(`/books/${icon.dataset.id}`);
                const book = await response.json();
                await fetch(`/books/${icon.dataset.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ read: !book.read })
                });
                this.renderBooks();
            });
        });
    },

    displayBoard: function() {
        board.style.display = board.style.display === "none" ? "flex" : "none";
        if (board.style.display === "none") form.reset();
    },

    addNewBook: async function(e) {
        e.preventDefault();
        const title = $('.new-book-title').value;
        const author = $('.new-book-author').value;
        const info = $('.new-book-info').value;
        await fetch('/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author, info })
        });
        this.renderBooks();
        form.reset();
    },

    init: function () {
        form.addEventListener('submit', (e) => this.addNewBook(e));
        addBoard.addEventListener("click", () => this.displayBoard());
        this.renderBooks();
    }
};

app.init();
