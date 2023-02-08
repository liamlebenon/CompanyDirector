// Get all employees from the Database
const fetchAllEmployees = () => {
    $.ajax({
        url: 'libs/php/getAll.php',
        type: 'POST',
        dataType: 'json',
        success: (result) => {
            // Assigns each employee a row on the table
            const employees = result.data;
            console.log(employees)
            employees.forEach(employee => {
                const fullname = `${employee.firstName} ${employee.lastName}`;
                $('#tableBody').append(
                    `<tr>
                        <td><a href="#" class="test" userid=${employee.employeeId}>${fullname}</a></td>
                        <td>${employee.location}</td>
                        <td>${employee.department}</td>
                    </tr>`
                )
            })
            $('#employeeCount').html(employees.length);
        }
    });
};

const populateDepartments = () => {
    $.ajax({
        url: 'libs/php/getAllDepartments.php',
        type: 'POST',
        dataType: 'json',
        success: (result) => {
            console.log(result)
            const departmentSelect = $('#userDepartment');
            result.data.forEach(department => {
                $('<option>', {
                    text: department.name,
                    value: department.id,
                    locationId: department.locationID
                }).appendTo(departmentSelect)
            });
        }
    });
};

// Util functions
// Capitalize First Letter
const capitalize = (string) => {
    return string[0].toUpperCase() + string.slice(1);
};

// Initial page load fetches all employees from database
$('document').ready(() => {
    fetchAllEmployees();
    populateDepartments();
});

// Navbar buttons

// Opens the create page
$('#createButton').click(() => {
    // Clears the form whenever the user opens the page
    $('#createNewUserForm').trigger("reset");
    $('#allEmployeesBox').hide();
    $('#employeeInfoBox').hide();
    $('#createNewUserBox').show();
});

// Brings user back to home page
$('#companyLogoButton').click(() => {
    $('#createNewUserBox').hide();
    $('#employeeInfoBox').hide();
    $('#allEmployeesBox').show();
}); 

$('#employeesButton').click(() => {
    $('#createNewUserBox').hide();
    $('#employeeInfoBox').hide();
    $('#allEmployeesBox').show();
}); 

// Submit form button
$('#createNewUserForm').submit(() => {
    // Clean up and capitalize form data
    const firstName = capitalize($('#userFirstName').val()).trim();
    const lastName = capitalize($('#userLastName').val()).trim();
    const email = $('#userEmail').val().trim();
    const departmentID = $('#userDepartment').val();

    // Checks if a department has been selected 
    if ($('#userDepartment').val() === null) {
        alert('Please select a department');
        return;
    }
    $.ajax({
        url: 'libs/php/insertEmployee.php',
        type: 'POST',
        dataType: 'json',
        data: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            departmentID: departmentID
        },
        success: () => {
            fetchAllEmployees();
        }
    });
});

const employeeDetails = {
    firstName: '',
    lastName: '',
    department: '',
    email: '',
    location: ''
};

$('table').click((e) => {
    const employeeId = e.target.getAttribute('userid');
    if (employeeId !== null) {
        $('#allEmployeesBox').hide();
        $('#employeeInfoBox').show();
        $('#employeeDetails').show()
        $.ajax({
            url: 'libs/php/getEmployeeByID.php',
            type: 'POST',
            dataType: 'json',
            data: {
                id: employeeId
            },
            success: (results) => {
                const employee = results.data.personnel[0];
                employeeDetails.firstName = employee.firstName;
                employeeDetails.lastName = employee.lastName;
                employeeDetails.department = employee.department;
                employeeDetails.email = employee.email;
                employeeDetails.location = employee.location;

                $('#employeeName').html(`${employeeDetails.firstName} ${employeeDetails.lastName}`);
                $('#employeePosition').html(employeeDetails.department);
                $('#employeeEmail').html(employeeDetails.email);
                $('#employeeLocation').html(employeeDetails.location)
            }
        });
    } 
});

$('#editEmployee').click(() => {
    $.ajax({
        url: 'libs/php/getAllDepartments.php',
        type: 'POST',
        dataType: 'json',
        success: (result) => {
            console.log(result)
            const editDepartmentSelect = $('#editDepartment');
            editDepartmentSelect.empty();
            result.data.forEach(department => {
                $('<option>', {
                    text: department.name,
                    value: department.id,
                    locationId: department.locationID
                }).appendTo(editDepartmentSelect)
            });
        }
    });
    $('#employeeDetails').hide();
    $('#editEmployeeForm').show();
    $('#editFirstName').val(employeeDetails.firstName);
    $('#editLastName').val(employeeDetails.lastName);
    $('#editEmail').val(employeeDetails.email);
    $('#initialDepartment').text(employeeDetails.department).change();
    console.log(employeeDetails.department)
});

$('#editUserButton').click((e) => {
    e.preventDefault();
});

$('#cancelEditButton').click((e) => {
    e.preventDefault();
    $('#editEmployeeForm').hide();
    $('#employeeDetails').show();
})

// Filter table search
$(document).ready(function(){
    $("#searchTable").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#tableBody tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  });
