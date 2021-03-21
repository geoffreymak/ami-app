const letters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const langs = [
  {
    short: "fr",
    long: "français",
  },
  {
    short: "ling",
    long: "lingala",
  },
];

export default function groupSongs(songs) {
  if (!songs) return;
  const letterGroups = [];
  const langGroups = [];

  letters.forEach((letter) => {
    const data = songs.filter(
      (song) => song.title.charAt(0).toLowerCase() === letter
    );
    if (!!data && !!data.length) {
      letterGroups.push({
        group: letter,
        data,
      });
    }
  });

  langs.forEach((lang) => {
    const data = songs.filter(
      (song) => song.laguage.toLowerCase() === lang.short
    );
    if (!!data && !!data.length) {
      langGroups.push({
        group: lang.long,
        data,
      });
    }
  });

  return [letterGroups, langGroups];
}
