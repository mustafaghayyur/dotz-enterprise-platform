APPENDIX OF TERMS
====================

This document will hold common jargon/acronyms found through out the code base, and their meanings.

A
--

> App: the app is a nearly stand alone section of the CRM. Apps can also be referred to as 'space' or 'module' in some parts of the codebase. The originally conceptualized apps for the DotzCRM were: 
  1. Tasks Module
  2. Tickets Module (refers to customer queries/requests)
  3. Documents Module
  4. Customers Module


B
--


C
--
 > child-table: for each Module (Tasks, Tickets, Documents, etc) there is the main Master table, symbolizing a single Master (i.e. Task, Ticket, etc.) records. And then several children-tables which carry additional data pertaining to the master-record.
 
 > CT: abbreviation for child-table (see above)

D
--

> Data Relationship Manager (DRM): Please see README.md of core.DRM directory for more info.
 

E
--


F
--


G
--


H
--


I
--


J
--


K
--


L
--


M
--
 > Module: see App

 > Master Table (mt) (or MT): stands for Master Table: usually refers to the parent table for a module that all children tables relate to. In Tasks module, this would be the 'tasks_task' table (unless configured differently).

 > Many-To-Many Children: a type of node in the system, where child-table nodes can't be retrieved as a single-latest revision of a master-table's record-set. These data-types need special handling for CRUD operations
 
 > M2M: see Many-To-Many Children above.

 > Mapper(): short-hand often used in code-base to refer to the core.DRMcore.mappers.RelationMappers() class instance.

N
--


O
--


P
--
 > Primitive Data Types (PDT): several built-in data types are often referred to as "primitive" because they form the basic building blocks for other data structures and store single values. Strings, Int, floats, Bool, None and Complex are main ones.

Q
--
 > QuerySets: querysets hold special meaning to DotzCRM, as we rely heavily on raw queries. These queryset classes can be found in core.DRMcore.querysets. Please see README.md in core.DRMcore for details.


R
--
 > Revision-less Children: a type of node in the system where child-table nodes don't carry revisions like normal module's Child Tables. These RLC need special handling for CRUD operations.
 
 > RLC: see Revision-less Children above.

S
--
 > space: may be used in CRUD operations. Space is another term for a module. See Module above for further info.

 > settings: the settings found in core.settings. These are system-wide configurations referenced is various classes for all CRM operations.

T
--
 > tbl-abbreviation: a 4 letter code to identify the schema table in mappers and DRM operations in general. Used throughout the DRM operations.

 > table-key: see tbl-abbreviation.

 > table-identifier: tbl-abbreviation.

U
--



V
--



X
--


Y
--


Z
--

