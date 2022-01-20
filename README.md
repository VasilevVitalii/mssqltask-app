# mssqltask-app
Many tasks for many Microsoft SQL Servers.
Can save queries results to JSON files (for example, to collect various statistics).
## 1. getting started
From https://drive.google.com/drive/folders/13qF-zbjZE8DPyhU5-tyyxaRlpdqWNPjF?usp=sharing download this compiled app for windows or linux.
Unzip and run. After first start app will create setting file **mssqltask-app.json** and directories **data**, **log**, **result**.
In directory **data** app will create examples:
* connecting to the server
* tasks

Additionally, the program contains web ui for editing tasks and viewing their performance. The **manage** section in the setting file is intended for its settings.

Change examples (app does not need to be restarted). The results of the exec tasks will be in the **results** directory.
## 2. how it works
![how it works](/artifacts/docs/howitwork.svg)
## 3. details
### 3.1. app settigs
Stored in **mssqltask-app.json**. Always near with app. Default setting:
```json
{
    "log": {
        "path": "log",
        "lifeDays": 10,
        "allowTrace": false
    },
    "data": {
        "pathMssql": "data/mssql",
        "pathTask": "data/task"
    },
    "task": {
        "maxThreads": 20,
        "path": "result"
    },
    "manage": {
        "allowApi": true,
        "allowUi": true,
        "passwordEdit": "",
        "passwordView": "",
        "http": "http://localhost:3084"
    }
}
```
### 3.2. tasks setting
App watch files in two directories (you can edit data into these directories outside of this app or through the web ui)
#### 3.2.1. connection store
First directory contains connections to MS SQL Servers. One file - one connection. Example file:
```json
{
    "instance": "myserver/myinstance",
    "login": "sa",
    "password": "1111",
    "tags": [
        "tag1"
    ]
}
```
* property **instance**, uniq
    - if the same instance is found in different files, these files will be ignored
    - as a separator between server name and instance name, i recommended use "**/**" (not "**\\**")
* properties **login** and **password**
    - app only supports mixed authentication
* property **tags**
    - details will be described below

#### 3.2.2. task store
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
* property **key**, uniq
    - if the same key is found in different files, these files will be ignored
    - max lenght - 50, valid characters - "0..9", "a..z", "A..Z", "-", "_"
* property **title**
    - will be used in UI, which is planned to be made in the next versions
* property **metronom**
    - supports two styles - cron style (used lib "https://github.com/node-schedule/node-schedule#readme") or custom style (**"periodicity" = "every" or "once"**):
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
* property **queries**
    - each query in array executed separately, cannot contain **GO**
    - all queries executed in one connection to base **tempdb**
    - comparison query in Microsoft SQL Server Management Studio and query in JSON:
    ```sql
    SELECT * FROM sys.objects
    GO
    SELECT * FROM sys.columns
    EXEC mybase.myschema.myproc
    PRINT 'hello'
    ```
    ```json
    "queries": [
        "SELECT * FROM list of sys.objects",
        "SELECT * FROM list of sys.columns\nEXEC mybase.myschema.myproc\nPRINT 'hello'",
    ],
    ```
* properties **allowRows** and **allowMessages**
    - allow to save queries results as json files in **result** directory
* property **mssqls**
    - links to mssql servers where run task
    - can specify tags or/and instances, example:
    ```json
    "mssqls": {
        "instances": [
            "myserver1/mysqlinstance",
            "myserver2/mysqlinstance",
        ],
        "tags": [
            "tag1",
            "tag2"
        ]
    }
    ```