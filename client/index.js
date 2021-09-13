let grpc = require("grpc")
let protoLoader = require("@grpc/proto-loader")
let readline = require("readline");
const { resolve } = require("path");


let reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var proto = grpc.loadPackageDefinition(protoLoader.loadSync("./../proto/vacaciones.proto", {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
}));

const REMOTE_URL = "0.0.0.0:50050";

let client = new proto.work_leave.EmployeeLeaveDaysService(REMOTE_URL, grpc.credentials.createInsecure());

function question(theQuestion) {
    return new Promise(resolve => reader.question(theQuestion, answ => resolve(answ)))
}

function isEligible(employeeData) {
    return new Promise(resolve => client.eligibleForLeave(employeeData, (err, res) => {
        resolve(res)
    }))
}

function grantVacation(employeeData) {
    return new Promise(resolve => client.grantLeave(employeeData, (err, res) => {
        resolve(res)
    }))
}

async function exec() {
    while (true) {
        var data = await getEmployeeData();
        var eligible = await isEligible(data)
        if (await eligible.eligible) {
            console.log(await grantVacation(data))
        }
    }
}



async function getEmployeeData() {
    let employee_id = await question("Id: ");
    let name = await question("Name: ");
    let accrued_leave_days = await question("Accrued: ");
    let requested_leave_days = await question("Requested: ");

    return {
        employee_id,
        name,
        accrued_leave_days,
        requested_leave_days
    };

}

exec()
