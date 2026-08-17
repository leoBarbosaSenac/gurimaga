const SUPABASE_URL = "https://gvhfsmzvjgyuufqoubce.supabase.co";
const SUPABASE_KEY = "sb_publishable_ULSRWqvRdIYnMZRSEcRAAA_iPGCadpG";

const { createClient } = supabase;

const database = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


const quoteForm = document.getElementById("quoteForm");
const quotesContainer = document.getElementById("quotesContainer");


// =========================
// LOAD QUOTES
// =========================

async function loadQuotes() {

    quotesContainer.innerHTML = `
        <div class="empty-message">
            Opening the book...
        </div>
    `;


    const { data, error } = await database
        .from("quotes")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        quotesContainer.innerHTML = `
            <div class="empty-message">
                Something went wrong while opening the book.
            </div>
        `;

        return;
    }


    displayQuotes(data);
}


// =========================
// DISPLAY QUOTES
// =========================

function displayQuotes(quotes) {

    quotesContainer.innerHTML = "";


    if (!quotes || quotes.length === 0) {

        quotesContainer.innerHTML = `
            <div class="empty-message">
                Não foram cadastradas frases ainda.
                <br>
                Quem sabe você não poderia cadastrar a primeira?
            </div>
        `;

        return;
    }


    quotes.forEach((quote) => {

        const quoteCard = document.createElement("article");

        quoteCard.classList.add("quote-card");


        quoteCard.innerHTML = `

            <div class="quote-symbol">
                “
            </div>

            <div class="quote-text">
                ${escapeHTML(quote.quote)}
            </div>

            <div class="quote-info">

                <span>
                    ✒
                    ${escapeHTML(quote.author)}
                </span>

                <span>
                    ✦
                    ${formatDate(quote.quote_date)}
                </span>

                <span>
                    ❧
                    ${escapeHTML(quote.context)}
                </span>

                <button
                    class="delete-button"
                    data-id="${quote.id}"
                >
                    Remove
                </button>

            </div>
        `;


        const deleteButton =
            quoteCard.querySelector(".delete-button");


        deleteButton.addEventListener(
            "click",
            () => deleteQuote(quote.id)
        );


        quotesContainer.appendChild(quoteCard);
    });
}


// =========================
// ADD QUOTE
// =========================

quoteForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const quote = document
            .getElementById("quote")
            .value
            .trim();


        const author = document
            .getElementById("author")
            .value
            .trim();


        const date = document
            .getElementById("date")
            .value;


        const context = document
            .getElementById("context")
            .value
            .trim();


        if (!quote || !author || !date || !context) {

            alert("Please fill in all fields.");

            return;
        }


        const { error } = await database
            .from("quotes")
            .insert({
                quote: quote,
                author: author,
                quote_date: date,
                context: context
            });


        if (error) {

            console.error(error);

            alert(
                "Something went wrong while saving the quote."
            );

            return;
        }


        quoteForm.reset();


        await loadQuotes();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


// =========================
// DELETE QUOTE
// =========================

async function deleteQuote(id) {

    const confirmed = confirm(
        "Are you sure you want to remove this quote?"
    );


    if (!confirmed) {
        return;
    }


    const { error } = await database
        .from("quotes")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Something went wrong while removing the quote."
        );

        return;
    }


    await loadQuotes();
}


// =========================
// FORMAT DATE
// =========================

function formatDate(date) {

    if (!date) {
        return "";
    }


    const parts = date.split("-");


    if (parts.length !== 3) {
        return date;
    }


    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


// =========================
// SECURITY
// =========================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// =========================
// START
// =========================

loadQuotes();
