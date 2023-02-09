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
            $('#tableLoader').css('display', 'none');
            $('#table').css('display', 'block');
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
    $('#editEmployeeForm').hide();    
}); 

$('#employeesButton').click(() => {
    $('#createNewUserBox').hide();
    $('#employeeInfoBox').hide();
    $('#allEmployeesBox').show();
    $('#editEmployeeForm').hide();
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
    location: '',
    employeeId: ''
};

$('table').click((e) => {
    $('#employeeDetailsLoaded').css('display', 'none');
    $('#employeeDetailsLoader').css('display', 'block');
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
                employeeDetails.id = employee.employeeId;

                $('#employeeName').html(`${employeeDetails.firstName} ${employeeDetails.lastName}`);
                $('#employeePosition').html(employeeDetails.department);
                $('#employeeEmail').html(employeeDetails.email);
                $('#employeeLocation').html(employeeDetails.location);

                $('#employeeDetailsLoader').css('display', 'none');
                $('#employeeDetailsLoaded').css('display', 'block');
            }
        });
    } 
});

$('#editEmployee').click(() => {
    $('#editDepartment').find('option').remove();
    $.ajax({
        url: 'libs/php/getAllDepartments.php',
        type: 'POST',
        dataType: 'json',
        success: (result) => {
            console.log(result)
            const editDepartmentSelect = $('#editDepartment');
            result.data.forEach(department => {
                if (employeeDetails.department === department.name) {
                    $('<option>', {
                        text: department.name,
                        value: department.id,
                        locationId: department.locationID,
                        selected: true
                    }).appendTo(editDepartmentSelect);
                } else {
                    $('<option>', {
                        text: department.name,
                        value: department.id,
                        locationId: department.locationID
                }).appendTo(editDepartmentSelect);
                }

            });
        }
    });
    $('#employeeDetails').hide();
    $('#editEmployeeForm').show();
    $('#editFirstName').val(employeeDetails.firstName);
    $('#editLastName').val(employeeDetails.lastName);
    $('#editEmail').val(employeeDetails.email);
    
});

// Delete Employee Functions
$('#deleteEmployee').click(() => {
    $('#confirmDeleteModal').modal("show");
    console.log(employeeDetails)
    $('#employeeNameToDelete').html(employeeDetails.firstName + ' ' + employeeDetails.lastName);
});

const deleteEmployeeByID = (employeeId) => {
    $.ajax({
        url: 'libs/php/deleteEmployeeByID.php',
        type: 'POST',
        dataType: 'json',
        data: {
            id: employeeId
        },
        success: (result) => {
            console.log('Employee Successfully deleted');
            console.log(result);
            fetchAllEmployees();
        }
    });
};

$('#confirmDeleteEmployee').click(() => {
    deleteEmployeeByID(employeeDetails.id);
});
// End Delete Employee Functions

// Edit Employee Functions
const updateEmployeeDetails = (employeeId) => {
    const firstName = capitalize($('#editFirstName').val()).trim();
    const lastName = capitalize($('#editLastName').val()).trim();
    const email = $('#editEmail').val().trim();
    const departmentID = $('#editDepartment').val();

    $.ajax({
        url: 'libs/php/updateEmployeeDetails.php',
        type: 'POST',
        dataType: 'json',
        data: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            departmentID: departmentID,
            id: employeeId,
        },
        success: (result) => {
            console.log('Employee successfully updated')
            fetchAllEmployees();
        }
    });
};

$('#editUserButton').click(() => {
    updateEmployeeDetails(employeeDetails.id);
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

