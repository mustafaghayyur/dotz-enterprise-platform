# GitHub Copilot / AI Agent Instructions for Dotz Enterprise Platform 🔧

## Purpose
Concise, actionable guidance to get an AI coding agent productive in this repository quickly. Focus on the architecture, developer workflows, and project-specific conventions (not general best practices).

## Big picture (what to know first) ✅
The Dotz Enterprise Platform is now a two part software:

 - Django (5.2.7) framework powers the backend API and templates generator.

 - $A library front-end SPA. Each 'app' will have its own app in the front-end, which is entirely coded in static/{app-name} directories.

 - We are using BootStrap 5.3 for all UI development. We use Tabs (more concretely defined in our $A.dashboard package), Modals, Off-canvas panes, and Collapse components to organize our views. We aim to enable $A.router in the future to allow URL access to any specific tab/modal/off-canvas view.



## More about the Dotz Platform:
- The Django project (Django 5.2.7) has modular apps: `core`, `tasks`, `tickets` (in question), `documents`, `customers`, `restapi`. See `project/settings.py` for installed apps.
  - `restapi`, `core` and `users` are likely more support apps that don't embody an actual front-end facing 'App' or 'Module'

- Single CUD entry point: **all Read/Create/Update/Delete must go through `restapi/`**. More accurately, the Universal API nodes we have aligned to work with our $A.query() library. 
 - views outside `restapi` should only compile and present a SPA DOM template for the $A library to manage.

- Data Relationship Manager (DRM): We have added a layer to Django's ORM for this projects CRUD operations.
  - The DRM layer handles all CRUD operations on this system. You will find all our RestAPI nodes typically using DRM operations to interact with the DataBase.
  - The DRM layer is meant to be more inteligent than a typical ORM, where it aspires to understand **RELATIONSHIPS** between data, and establish laws of how data entries and deletions should flow through the system.
  - Please inspect core/DRMcore/ to understand how DRM works.
    - DRMcore/crud: handles create, read, update and delete operations for any MAPPER.
    - DRMcore/mapper: a mapper is like a giant "model" for an entire sub-sytem or sub-system entity. Entities could be something like User entity/mapper. While a User model, only handles the data that the auth_user table holds. The User Mapper handles, the User Model, plus all child tables that relate to it, such as the User Profile, User Setting, etc child tables.
      - Furthermore: the child-tables of a Mapper can hold distinct types of relationships to the Master table: One-to-One, Many-to-One (known as RLC in our system), and Many-to-Many.
    - DRMcore/queryset: the QuerySet DRM extension adds a powerful QuerySet.fetch() method to all our Models. Why did we make our own custom-fetch when Django has a Model.find() method in place? Our QuerySet.fetch() operation is more closely aligned with DRM's custom features, such as the tbl-codes.


## Other notes on DRM/API use:
- The `{app}/drm/mappers.py` defines a loose schema for our system. The mapper classes often define valid ENUM values for DB column fields; or which columns can be ignored in certain CRUD operations, etc... Consider mapper classes (where ever you find them in drm directories) to be a loose schema defining aparatus.
- We will use the universal CRUD and List api nodes for all api calls from the front-end JS app. Seperate special api nodes can be created for specific needs, however most crud and search queries from the front-end will use the restapi.views.list and restapi.views.crud nodes to retrieve system data.
- The front-end is built with Bootsrap and an in-house JS library $A. The $A library is a collection of helper modules/functions largely defined in static/core/js/ directory. Most $A library code is well documented with comments.
  - We use the $A library, typically, with the following notation:
    $A.someModule.someFunction()
    For example, $A.query, is a module defined in static/core/js/lib/query.js, so we can use a method like search() like this:
    $A.query.search(tableKey);

- Naming convention: we use (Camel Case) camelCase for ALL file names, ALL class names and ALL variable names in BOTH Python & Javascript. Please see: `https://github.com/mustafaghayyur/dotz-enterprise-platform/wiki/Coding-Standards` 
  - We also use camelCase for most HTML DOM id attribute values.

## Key patterns & concrete examples ⚠️
- LAWS OF CRUD: implement CUD in DRM classes and, when applicable, update the corresponding `core/DRMcore/querysets` logic. Example: change in tasks CRUD should touch `tasks/drm/crud.py` and any query logic in `core/DRMcore/querysets` or `tasks/drm/querysets`.
- Query assembly: Please use MapperEntityCRUD.read().select().where().join().orderby().limit().fetch() for all queries where possible.
- REST endpoints use DRF `@api_view` functions, and return paginated JSON with `results`. Use core.helpers.crud.generate**() functions to return all errors and results for better formtting of results.


## Developer workflows (commands & examples) 🔧
- Django: use `manage.py` for local tasks (e.g., `python manage.py runserver`, `python manage.py migrate`).
- Database: MySQL (see `project/settings.py`); recommended server settings in `https://github.com/mustafaghayyur/dotz-enterprise-platform/wiki/MYSQL-Server-Settings`.
- Frontend: inside `static/` run `npm install` and `npm run build` . SASS compile: `sass ./scss/dotzstrap.scss:./css/dotzstrap.css`.
- Deployment: mod_wsgi is the expected production setup (top-level `README.md`).

## Logs & debugging 💡
- Logging: all crud is logged (in dev) in our ~/Sites/logs/dotzsoft/ dir. 
- We can also use misc.log() helper function to log custom info during debugging in ~/Sites/logs/dotzsoft/DEBUG.log.
- Server logs: `logs/httpd/` (httpd) and `logs/mysqld/` (MySQL). Use these when debugging DB/HTTP issues.
- TESTING: To run Django tests you may run:
> python3 manage.py test {app}.tests.{filename}.TestClass.test_name 

## Notes about Tests:
 1) filenames: should be brief: remove 'test' and simply describe purpose in short verbage.
 2) TestClass: remove unnecessary 'Test' prefix, just short descriptor signifying purpose of class.
 3) test-names: similarly, remove the 'test_' prefix. Instead use 'one*', 'two*', 'three*', etc identifiers, so each test is easy tidentify.
 4) We are using Jest for JS testing.
 5) We are using Django's Test Unit for back-end testing.


## Conventions for AI edits ✍️
- Use core.helpers.crud.generate**() functions to deliver all JSON results and errors correctly.
- I will use {project-root}/browser-console.log has a dump file to place all browser console logs when attempting to express what I see in the browser's console. Please refer to this file when I say inspect browser-console.log.


## Where to look first (quick file pointers) 📎
-  We are building an online knowledge-base: `https://github.com/mustafaghayyur/dotz-enterprise-platform/wiki/`

- you can also explore all 'README.md' files found throughout the system. They often carry early-development notes.

- App DRM examples: `tasks/drm/crud.py`, `tasks/drm/querysets/` (and any future `app_name/drm/*` implemenetations that get added.)

- Settings & DB: `project/settings.py`, `core/dotzSettings.py`. Also `app_name/drm/*_mappers_*.py` are additional places where project settings may be found.

- Frontend: `static/package.json`, `static/README.md`, `webpack.config.js`, etc..

- Project PRs carry a lot of my thoughts on development, progress, goals for future. Can be informative to read PR messages: `https://github.com/mustafaghayyur/dotz-enterprise-platform/pulls?q=is%3Apr+is%3Aclosed`


## Small checklist: ✅
- Add/modify REST endpoint in `restapi/` for any new CRUD API.
- When in doubt: prefer DRM + restapi changes over model or ad-hoc DB access.  ✅


# AI Guidelines for all work on this project:

## 1. Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.

### Before implementing:

 - State your assumptions explicitly. If uncertain, ask.

 - If multiple interpretations exist, present them - don't pick silently.

 - If a simpler approach exists, say so. Push back when warranted.

 - If something is unclear, stop. Name what's confusing. Ask.


## 2. Simplicity First
Minimum code that solves the problem. Nothing speculative.

 - No features beyond what was asked.
 - If you write 200 lines and it could be 50, rewrite it.
 - Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.


## 3. Surgical Changes
Touch only what you must. Clean up only your own mess.

When editing existing code:

 - Don't "improve" adjacent code, comments, or formatting.

 - Don't refactor things that aren't broken.

 - Match existing style, even if you'd do it differently.

 - If you notice unrelated dead code, mention it - **don't delete it**.


### When your changes create orphans:

 - Remove imports/variables/functions that YOUR changes made unused.

 - Don't remove pre-existing dead code unless asked.

 - The test: Every changed line should trace directly to the user's request.


These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
