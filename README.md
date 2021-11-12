# mssqltask-app
Tasks for many Microsoft SQL Servers

## how it works
App watch files in two directories:
#### connection store
First directory contains connections to MS SQL Servers. One file - one connection. Example file:
``````json
{
    "instance": "myserver/myinstance",
    "login": "sa",
    "password": "1111",
    "tags": [
        "tag1"
    ]
}
``````
* property **instance**:
- if the same instance is found in different files, these instances will be ignored
- as a separator between server name and instance name, i recommended use **/**
* property **tags** optional

#### task store
Second directory contains tasks (with a list of MS SQL Servers for which this task should be executed). One file - one task. Example file:
``````json
{
    "key": "key1",
    "title": "list of sys.objects",
    "metronom": {
        "kind": "cron",
        "cron": "0 */1 * * * *"
    },
    "queries": [
        "SELECT * FROM list of sys.objects"
    ],
    "allowRows": true,
    "allowMessages": true,
    "mssqls": {
        "tags": [
			"tag1"
		]
    }
}
``````