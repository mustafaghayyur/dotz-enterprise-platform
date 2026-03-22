# GitHub Copilot / AI Agent Instructions for Dotz CRM + PM Software 🔧

## Purpose
Concise, actionable guidance to get an AI coding agent productive in this repository quickly. Focus on the architecture, developer workflows, and project-specific conventions (not general best practices).

## Big picture (what to know first) ✅
- Monolithic Django app (Django 5.2.7) with modular apps: `core`, `tasks`, `tickets`, `documents`, `customers`, `restapi`. See `project/settings.py` for installed apps.
- Single CUD entry point: **all Create/Update/Delete must go through `restapi/`**; views outside `restapi` should only read data. See `restapi/README.md`.
- Data Relationship Manager (DRM) layer centralizes CRUD logic: look at `core/DRMcore/crud` (crud classes) and `core/DRMcore/querysets/` (query assembly). DRMs often compose SQL-like selectors/conditions rather than relying directly on Django model convenience.
- The `app_name/drm/mappers.py` define a loose schema for our system. The mapper classes often define valid ENUM values for DB column fields; or which columns can be ignored in certain CRUD operations, etc... Consider mapper classes (where ever you find them in drm directories) to be a loose schema defining aparatus.
- We will use the universal CRUD and List api nodes for all api calls from the front-end JS app. Seperate special api nodes can be created for specific needs, however most crud and search queries from the front-end will use the restapi.views.list and restapi.views.crud nodes to retrieve system data.
- The front-end is built with Bootsrap and an in-house JS library $A. The $A library is a collection of helper modules/functions largely defined in static/core/js/ directory. Most $A library code is well documented with comments.
  - We use the $A library, typically, with the following notation:
    $A.someModule.someFunction()
    For example, $A.query, is a module defined in static/core/js/lib/query.js, so we can use a method like search() found there with the following code:
    $A.query.search(tableKey);

- Naming convention: we use (Camel Case) camelCase for ALL file names, ALL class names and ALL variable names in BOTH Python & Javascript.
  - We also use camelCase for most HTML DOM id attribute values.

## Key patterns & concrete examples ⚠️
- LAWS OF CRUD: implement CUD in DRM classes and, when applicable, update the corresponding `core/DRMcore/querysets` logic. Example: change in tasks CRUD should touch `tasks/drm/crud.py` and any query logic in `core/DRMcore/querysets` or `tasks/drm/querysets`.
- Query assembly: QuerySetManager and mapper objects build selectors/conditions (see `core/DRMcore/querysets/`); follow the selectors/conditions/limit style used across `restapi` views (e.g., `restapi/views/tasks.py`).
- REST endpoints use DRF `@api_view` and return paginated JSON with `results` — follow the shape in `restapi/views/tasks.py` (use `CRUD().read(...)`, serializers like `TaskO2ORecordSerializerGeneric`).
- Internal helper views: conventionally, view helpers found in `views/helpers/` directory, are not directly exposed to URLs (see docstring in `restapi/views/tasks.py`).
- Logging: CRUD validation and logging occur via `core/DRMcore/crud/Validation.py` (calls `misc.log(..., crud=True)`); logs are written to `core/settings.py` configured path (`tasks['crud_logger_file']`, defaults to `/Users/mustafa/Sites/python/server1/CRUD.log`) and only when `DEBUG` is True.

## Developer workflows (commands & examples) 🔧
- Django: use `manage.py` for local tasks (e.g., `python manage.py runserver`, `python manage.py migrate`).
- Database: MySQL (see `project/settings.py`); recommended server settings in `CRM-DOCUMENTATION/7.MySQL-Server-Settings.md`.
- Frontend: inside `static/` run `npm install` and `npm run build` (or `npm run build:core` / `npm run build:tasks`). SASS compile: `sass ./scss/dotzstrap.scss:./css/dotzstrap.css`.
- Deployment: mod_wsgi is the expected production setup (top-level `README.md`).

## Logs & debugging 💡
- CRUD log: `core/settings.py` -> `tasks['crud_logger_file']` (default `/Users/mustafa/Sites/python/server1/CRUD.log`).
- Server logs: `logs/httpd/` (httpd) and `logs/mysqld/` (MySQL). Use these when debugging DB/HTTP issues.
- TESTING: To run Django tests you may run:
> python3 manage.py test {app}.tests.{filename}.TestClass.test_name 

Notes about Tests:
 1) filename: should be brief: remove 'test' and simply describe prupose in short verbage.
 2) TestClass: remove unnecessary 'Test' prefix, just short descriptor signifying purpose of class.
 3) test_name: similarly, remove the 'test_' prefix. Instead use 'one_', 'two_', 'three_', etc identifiers, so it's each to pcik which test failed/passed.


## Conventions for AI edits ✍️
- When changing DB behavior:
  1) Please note that DRM's core logic has been developed in the `core/DRMcore/` dir. However, each app (including `core`) will have a seperate `app_name/drm/` (in lower-case) directory, where implementations/inherited child classes referecncing specific tables/columns that relate to the app in question, will reside.
  2) Update the CRUD class-methods (e.g., found in `tasks/drm/crud.py`, `core/drm/crud.py`, or `tickets/drm/crud.py`), as the app needs to modify CRUD operations behaviour.
  3) Update the queryset methods to add specific READ-only custom queries where a fetch query is required in the system (in `app_name/drm/querysets.py`).
  4) Update any mapper info in `app_name/drm/mappers.py` that will define schema relations, if you find this effecient.
  5) If the change exposes a new CUD surface, add a `restapi/` endpoint and corresponding validators/serializers (see `restapi/validators/tasks.py`).
- Use explicit file references in PR descriptions and code suggestions (e.g., “modify `tasks/drm/crud.py` and `tasks/drm/querysets/*`”).
- Preserve `context.results` convention when adding non-REST read views; keep error handling consistent with `restapi` patterns (use DRF `Response` and `status` codes).

## Where to look first (quick file pointers) 📎
- Core CRUD rules: `core/DRMcore/README.md`, `core/DRMcore/crud/Validation.py` (logging & validation)
- REST entry points: `restapi/README.md`, `restapi/views/`, `restapi/validators/`
- App DRM examples: `tasks/drm/crud.py`, `tasks/drm/querysets/` (and any future `app_name/drm/*` implemenetations that get added.)
- Settings & DB: `project/settings.py`, `core/settings.py`. Also `app_name/drm/*_mappers_*.py` are additional places where DRM settings may be found.
- Frontend: `static/package.json`, `static/README.md`, `webpack.config.js`

## Small checklist for PRs (recommended) ✅
- Make sure CUD logic lives in `app_name/drm/*` and relevant querysets are updated. You can also suggest changed to `core/DRMcore/*` files if some edit relates to DRM's core functionality or has project-wide implications.
- Add/modify REST endpoint in `restapi/` for any new CUD API.
- Update `core/settings.py` only for environment-specific defaults; do not leave `DEBUG=True` in production.
- Include short, specific QA steps (how to reproduce or verify the change locally).

When in doubt: prefer DRM + restapi changes over model or ad-hoc DB access. If you'd like, I can open a PR updating this file and include a short changelog entry; otherwise tell me any missing/incorrect bits and I'll revise the instructions. ✅