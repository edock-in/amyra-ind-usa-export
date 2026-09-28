# Contributing

Thank you for helping more people in India learn to export.

## Who can change what

- **Anyone** can play, fork, copy, change and sell this game under the [MIT License](LICENSE). No permission is needed. Anyone can also open an issue to report a bug or an outdated rule.
- **Verified Edock users** can make changes to this repository itself, including the live game at [games.edock.io/amyra-ind-usa-export](https://games.edock.io/amyra-ind-usa-export).

## Getting access as a verified Edock user

1. Open an issue with the **Verified Edock contributor access** template.
2. Give your Edock username. Issues are public, so never post your email, phone number, PAN or any ID document.
3. An Edock maintainer checks that your Edock account is verified.
4. You are added to the Edock contributors team on GitHub, which has write access to this repository.

Access ends if your Edock account is no longer verified, or if it is used to harm the project.

## Making a change

1. Create a branch from `main` with a short name, such as `content/lut-renewal-date` or `fix/hud-overflow`.
2. Edit the files in `src/`. Most content lives in `src/content.js`.
3. Run `./build.sh` and commit both your `src/` changes and the rebuilt `index.html`, `artifact.html` and `guide/index.html`. A check on every pull request fails if the built files are out of date.
4. Open a pull request and fill in the checklist.
5. Another verified contributor reviews it. Once it is merged into `main`, it goes live.

## House rules

- **Plain words first.** Write for someone who has never exported anything. One short line per card. Official terms come after the idea, as stamps.
- **Pictures over text.** Every choice needs an icon or a picture. Draw new icons in `src/art.js`.
- **Rupees next to dollars.** Any dollar amount a player sees also shows its rupee value at the `FX` rate.
- **Cite a source for every fact.** When you change a rule, form, fee, deadline or duty rate, link an official source in the pull request. Good sources include DGFT, the GST portal, RBI, ICEGATE, USPTO, IRS, FDA, CPSC, US Customs and Border Protection, and Amazon Seller Central help pages.
- **Keep it one static page.** No image or audio files, no trackers, no analytics, and no new network requests other than Google Fonts. The page must work as a plain file and inside hosts that block other sites.
- **Collect nothing.** The game stores progress only in the player's own browser and never sends personal data anywhere. Links to edock.io carry campaign tags, built by `tagged()` in `src/game.js`. Keep them, so Edock can see which game sent each visitor.
- **Test before you ask for review.** Play one full run at phone width and on a desktop, with sound on and off.

## Reporting outdated information

Rules and fees change. If you spot something out of date, open an issue with the **Outdated rule or number** template and include an official source.

## Be kind

Be respectful in issues and reviews. Maintainers may remove comments or access for harassment, spam or bad-faith changes.
