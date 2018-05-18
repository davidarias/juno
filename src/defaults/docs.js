let doc = `# Code literature default template

Please comment me using this template.

## Format

This document uses markdown syntax.

## Description

Describe what this method/object does in *one* phrase.

## Rationale

Provide a rationale about *why this code entity exists* and what is *its purpose*.

Reasoning about *why* might help other people understand the code, but
also can help the author to structure the code in a clear and understandable way.

## Other useful sections

- High level exaplation of the code ( for packages )
- How this entity relates to others
- parameters, type and a small description ( for methods )
- return value(s) ( for methods )
- examples

## Metadata

In the metadata tab, you can add some aditional data to this object/method
using yaml syntax

For Juno IDE some keys have a special meaning:

- categories: aditional categorizing for objects/methods

Other recomended metadata keys:

- contributors: a list of people that cointributed to the code entity
`;

export default doc;
