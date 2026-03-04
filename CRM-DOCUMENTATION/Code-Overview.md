# Overview & Code Introduction

Dotz CRM + PM Software is built with  Web Dotz Performant principles in mind. Software built right, from day one. This CRM + PM software promises to be enterprise grade, with feature-rich, highly versatile and reliable architechture.

## Mapper-Centric Design

Dotz CRM + PM Software is centered around Mappers. All CRUD operations, will use what we refer to as a Mapper, to organize deta, perform C.U.D. operations. Our mappers carry all definitions needed to handle creation, updates, deletion and reading of data from the database, upto the final context delivered to the front-end.

What are mappers? Mappers attempt to provide the same understanding that traditional Java-based software's Schema definitions would provide. They create meaning relationships between tables and columns. Tell the application layer what data is connected to other data in the system; so while performing a update, create, delete or read task - make sure to handle all related data pieces as well.

How does this play out? Let's take a walk-through of a simple create example:

When a user submites a create command to Dotz CRM + PM Software, through the API, our software primarily asks for the table-code - a four-character key indentifying the table in question - and performas the necessary tasks accordingly.

What is the table-code? The four-character code (such as "titi") allows the software to identify which table we are primarily performing the create operation on. Once it knows that "titi" refers to the master-table for Tickets, it retrives the Model for that table; with the table's model, it can access the Model.objects ORM Manager, which allows us to that access the mapper we have integrated into the ORM Model Manager. 

The titi code -> allows access to Tickets Model -> allows access to Ticket's Model Manager -> allows access to Mapper associated with Tickets.

Once we have access to the Tickets Mapper, which would be defined in tickets.drm.tickets_mapper, we can now fully access anything meaningful to Tickets management.

Continuing with our above example of a create request to 'titi' table for the following POST data:

    {
        description: "Request to send 500 units of Tangy Green Soaps in next Shipment",
        type: "order-request",
        deadline: "2028-06-15T00:00:00Z",
        details: "...here full text of ticket request would be placed, consisting of multi-line text",
        documents: ["list of", "file references from", "document repository"],
    }

@todo complete walk-through
