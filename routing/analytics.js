const express = require("express");

const router = express.Router();
const mongoose = require('mongoose');
const UserSchema = require('../schemas/UserSchema');
const UserModel = mongoose.model("UserModel", UserSchema);
const TaskModel = require('../schemas/TaskSchema');

//app.get/post/put/delete => router.get/post/put/delete

router.post('/modificationByField', async (req, res) => {
    let tasks = []
    const { serverFilters } = req.body
    const { fieldName, values, qaRepresentative, startDate, endDate, label } = serverFilters;
    console.log(fieldName, values, label, qaRepresentative)

    //here we build the match expression according to the user's filters.

    let filtersArray = [] // add the startdate and enddate and label here
    let matchFilterValue = {
        "$and": []
    }
    if (fieldName.length != 0) {
        filtersArray.push({ "diffItem.updatedField.fieldName": fieldName[0] })
    }
    if (qaRepresentative.length != 0) {
        filtersArray.push({ "jiraItem.qaRepresentative": qaRepresentative[0] })
    }
    if (values.length != 0) {
        let valuesArray = []
        values.map((item, index) => {
            valuesArray.push({ "diffItem.updatedField.newValue": item })
        })
        filtersArray.push({ "$or": valuesArray })
    }
    if (filtersArray.length == 0) { // we should remove this condition after we add the time
        delete matchFilterValue.$and;
    }
    else {
        matchFilterValue["$and"] = filtersArray
    }

    tasks = await TaskModel.aggregate([
        {
            $match: matchFilterValue
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$diffItem.updatedTime" } },
                    fieldName: "$diffItem.updatedField.fieldName"

                },
                tasks: { $push: "$$ROOT" },
            }
        },
        {
            $group: {
                _id: "$_id.date",
                arr: { $push: { fieldName: "$_id.fieldName", tasks: "$tasks", size: { $size: "$tasks" } } },

            }

        }
    ])
    let maxLength = 0;
    let sumLength = 0;
    if(tasks.length > 0){
        let myArray = tasks[0].arr;
        myArray.forEach(element => {
            if (element.size > maxLength) {
                maxLength = element.size
            }
            sumLength += element.size
        })
        tasks[0].maxLength = maxLength
        tasks[0].sumLength = sumLength
    }
    res.send(tasks)
})


router.post('/modificationByFieldFilters', async (req, res) => {
    let tasks = []
    const { fieldName } = req.body
    if (fieldName.length == 0) { // runs to bring all the fieldNames when reloading
        tasks = await TaskModel.aggregate([
            {
                $group: {
                    _id: null,
                    labels: { $addToSet: { "label": "$diffItem.updatedField.fieldName", "value": "$diffItem.updatedField.fieldName" } },
                    QA: { $addToSet: { "label": "$jiraItem.qaRepresentative", "value": "$jiraItem.qaRepresentative" } }
                },
            }
        ])
    }
    else { // bring all the QA and Values
        const name = fieldName[0];
        tasks = await TaskModel.aggregate([
            {
                $match: { "diffItem.updatedField.fieldName": name, "diffItem.type": "Update" }
            },
            {
                $group: {
                    _id: null,
                   // QA: { $addToSet: { "label": "$jiraItem.qaRepresentative", "value": "$jiraItem.qaRepresentative" } },
                    Values: { $addToSet: { "label": "$diffItem.updatedField.newValue", "value": "$diffItem.updatedField.newValue" } },
                }
            },
        ])
    }

    res.send(tasks)
})


// router.post('/changeOfJIRATicketsStatus', async (req, res) => {

//     // const filterValue = 'newValue'     //old or new value
//     // const filterStatus = 'Backlog'     // Done , in progress , Backlog ,In Integration ...
//     // const filterQaRep = 'Sally'

    const filterValue = req.body.values
    const filterStatus = req.body.status
    const filterQaRep = req.body.qaRepresentative[0]

//     console.log("nimer")
//     console.log(filterValue, filterStatus, filterQaRep)
//     console.log("nimer")


    //here we build the match expression according to the user's filters.

    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


    let filtersArray = [];
    let orArray = [];

    //default filters

    let matchFilterValue ={ "$and": [] };
    filtersArray.push({ 'diffItem.type': 'Update' })
    filtersArray.push({ 'diffItem.updatedField.fieldName': 'status' })
    // matchFilterValue.push({ "$and": [] })

    if (filterQaRep != undefined) {
        filtersArray['jiraItem.qaRepresentative'] = filterQaRep
    }

    //multiselect status
    if (filterStatus[0] != undefined && filterValue[0] != undefined) {
        if (filterStatus.length != 0) {
            let statusArray = []
            filterStatus.map(item => {
                if (filterValue == "newValue") {
                    statusArray.push({ "diffItem.updatedField.newValue": item })
                }
                else {
                    statusArray.push({ "diffItem.updatedField.oldValue": item })
                }
            })
            // orArray.push(statusArray);
            filtersArray.push({ "$or": statusArray })
        }
    }



    if (filtersArray.length == 0) {
        delete matchFilterValue.$and;
    }
    else {
        matchFilterValue["$and"] = filtersArray
    }

    //multiselect QA REP
    // if(filterQaRep.length != 0){
    //     let qaArray = []
    //     filterQaRep.map(item => {
    //         qaArray.push({'jiraItem.qaRepresentative':item})
    //     })
    //     orArray.push(qaArray)
    // }

    // if(orArray.length != 0){

    //     matchFilterValue.push({"$and":[]}) 

    // }
    // 'diffItem.type': 'Update',
    // 'diffItem.updatedField.fieldName': 'status',

    // if (filterStatus != undefined) {
    //     matchFilterValue[`diffItem.updatedField.${filterValue}`] = filterStatus
    // }

    // if (filterQaRep != undefined) {
    //     matchFilterValue['jiraItem.qaRepresentative'] = filterQaRep
    // }


    console.log(matchFilterValue)


//     console.log(matchFilterValue)

//     const tasks = await TaskModel.aggregate([
//         {
//             $match: matchFilterValue
//         },
//         {
//             $group: {
//                 _id: {

//                     Val: `$diffItem.updatedField.${filterValue}`

//                 },
//                 tasks: { $push: "$$ROOT" },
//             }
//         },
//         {
//             $group: {
//                 _id: "$_id.Val",
//                 arr: { $push: { tasks: "$tasks", size: { $size: "$tasks" } } },

//             }

    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

//     ])


//     // console.log("YOUSEF")
//     let total = 0;
//     tasks.forEach(element => {
//         total += element.arr[0].size
//     })
//     tasks.total = total
//     // console.log(tasks)

//     // tasks.forEach(element => {
//     //     console.log(element.arr[0].tasks[0].jiraItem)
//     // })


//     res.send(tasks);

// })



// //  !!-------------------------------------------- Sally --------------------------------------------!!
// router.post('/changeOfJIRATicketsStatusFilters', async (req, res) => {

    tasks = await TaskModel.aggregate([
        {
            $match: matchFilters
        },
        {
            $group: {
                _id: null,
                status: { $addToSet: { "label": groupFilters, "value": groupFilters} },
                qa: { $addToSet: { "label": "$jiraItem.qaRepresentative","value": "$jiraItem.qaRepresentative" } }
            },
        }
    ])

//     let filterVal = 'newValue'
//     filterStatus = ''
//     if (filterVal == 'oldValue') {
//         groupFilters = "$diffItem.updatedField.oldValue"
//     }
//     else {
//         groupFilters = "$diffItem.updatedField.newValue"
//     }
//     if (filterStatus.length != 0) {
//         matchFilters = {
//             'diffItem.type': 'Update',
//             'diffItem.updatedField.fieldName': 'status',
//             // 'diffItem.updatedField.oldValue': filterStatus,
//             // 'jiraItem.qaRepresentative': filterQaRep
//         }
//     }
//     else {
//         matchFilters = {
//             'diffItem.type': 'Update',
//             'diffItem.updatedField.fieldName': 'status'
//         }
//     }

//     tasks = await TaskModel.aggregate([
//         {
//             $match: matchFilters
//         },
//         {
//             $group: {
//                 _id: null,
//                 status: { $addToSet: { "label": groupFilters, "value":groupFilters } },
//                 qa: { $addToSet: { "label": "$jiraItem.qaRepresentative","value":"$jiraItem.qaRepresentative" } }
//             },
//         }
//     ])


//     console.log(tasks)
//     res.send(tasks)

// })


/*
1.filters and      NOT NOW =>  uiobj without filters
2.for each change in the filters, send new uiobj according to the filters applied
*/
module.exports = router;