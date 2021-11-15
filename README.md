# mssqltask-app
Many tasks for many Microsoft SQL Servers.
Can save results to JSON files (for example, to collect various statistics).

## 1. getting started

From https://drive.google.com/drive/folders/13qF-zbjZE8DPyhU5-tyyxaRlpdqWNPjF?usp=sharing download app for windows or linux.
Unzip and run. After first start app will create setting file "mssqltask-app.json" and directories "data", "log", "result".
In directory "data" app will create examples:
* connecting to the server
* tasks

Change examples (app does not need to be restarted). The results of the exec tasks will be in the "results" directory.

## 2. how it works

![work schema](/artifacts/docs/howitwork.svg)

## 2. app settings - mssqltask-app.json

Stored

## 1. how it works
### 1.1. tasks setting
App watch files in two directories (you enter data into these directories outside of this app):
#### 1.1.1. connection store
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
* property **instance**, required, uniq
    - if the same instance is found in different files, these files will be ignored
    - as a separator between server name and instance name, i recommended use "**/**" (not "**\\**")
* properties **login** and **password**, required
    - app only supports mixed authentication
* property **tags**, optional
    - details will be described below

#### 1.1.2. task store
Second directory contains tasks (with a list of MS SQL Servers for which this task should be executed). One file - one task. Example file:
```json
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
```
* property **key**, required, uniq
    - if the same key is found in different files, these files will be ignored
    - max lenght - 50, valid characters - "0..9", "a..z", "A..Z", "-", "_"
* property **title**, optional
* property **metronom**, required
    - supports two styles - cron style (used lib "https://github.com/node-schedule/node-schedule#readme") or custom style ("periodicity" = "every" or "once"):
```json
    "metronom": {
        "kind": "cron",
        "cron": "0 */1 * * * *"
    }

    "metronom": {
        "kind": "custom",
        "weekdaySun": true,
        "weekdayMon": true,
        "weekdayTue": true,
        "weekdayWed": true,
        "weekdayThu": true,
        "weekdayFri": true,
        "weekdaySat": true,
        "periodMinutes": 1,
        "periodicity": "every"
    }
```
* property **queries**, required
    - each query in array executed separately, cannot contain "GO"
    - all queries executed in series in one connection
    - comparison query in Microsoft SQL Server Management Studio and query in JSON:
```sql
    SELECT * FROM sys.objects
    GO
    SELECT * FROM sys.columns
```
```json
    "queries": [
        "SELECT * FROM list of sys.objects",
        "SELECT * FROM list of sys.columns",
    ],
```
* properties **allowRows** and **allowMessages**, required
    - 