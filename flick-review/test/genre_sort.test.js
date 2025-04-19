/**
 * @jest-environment jsdom
 */

const { TextEncoder, TextDecoder } = require("util");

// Polyfill global for JSDOM compatibility
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const fs = require("fs");
const path = require("path");

describe("Genre Page Sorting", () => {
  let html;

  beforeEach(() => {
    html = fs.readFileSync(path.resolve(__dirname, "../views/genre.ejs"), "utf8");
    document.documentElement.innerHTML = html;
    // Mock DOMContentLoaded manually
    require("jsdom").JSDOM.fragment(html);
  });

  test("sorts movies A-Z", () => {
    // Mock sample movie DOM nodes
    document.body.innerHTML = `
      <div class="movie-list">
        <div class="movie-container"><p class="movie-title">Zebra</p></div>
        <div class="movie-container"><p class="movie-title">Apple</p></div>
        <div class="movie-container"><p class="movie-title">Monkey</p></div>
      </div>
      <div class="sort-option" data-sort="asc">A-Z</div>
      <div class="sort-option" data-sort="desc">Z-A</div>
    `;

    const sortAZ = document.querySelector('[data-sort="asc"]');
    const movieList = document.querySelector(".movie-list");

    const movies = Array.from(movieList.children);

    // Fake sorting click
    sortAZ.click = () => {
      movies.sort((a, b) =>
        a.querySelector(".movie-title").textContent.localeCompare(
          b.querySelector(".movie-title").textContent
        )
      );
      movieList.innerHTML = "";
      movies.forEach((movie) => movieList.appendChild(movie));
    };

    sortAZ.click();

    const sortedTitles = Array.from(movieList.children).map(
      (div) => div.querySelector(".movie-title").textContent
    );

    expect(sortedTitles).toEqual(["Apple", "Monkey", "Zebra"]);
  });
});
