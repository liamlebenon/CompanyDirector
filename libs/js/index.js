// Get all employees from the Database
const fetchAllEmployees = () => {
    $.ajax({
        url: 'libs/php/getAll.php',
        type: 'POST',
        dataType: 'json',
        success: (result) => {
            // Assigns each employee a row on the table
            const employees = result.data;
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
        url: 'libs/php/getAllDepartmentsWithLocationID.php',
        type: 'POST',
        dataType: 'json',
        success: (result) => {
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

let locations;
let departments;
let firstLoad = true;

const getAllLocations = () => {
    $.ajax({
        url: 'libs/php/getAllLocations.php',
        type: 'POST',
        dataType: 'json',
        success: (results) => {
            locations = results.data;
        }
    });
};
getAllLocations();

const getAllDepartments = () => {
    $.ajax({
        url: 'libs/php/getAllDepartments.php',
        type: 'POST',
        dataType: 'json',
        success: (results) => {
            departments = results.data;
        }
    });
};
getAllDepartments();

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

// Opens the create Employee page
$('#createEmployeeButton').click(() => {
    // Clears the form whenever the user opens the page
    $('#createNewUserForm').trigger("reset");
    hideAllDivs();
    $('#createNewUserBox').show();
});

// Opens the create Department page
$('#createDepartmentButton').click(() => {
    // Clears the form whenever the user opens the page
    $('#createNewDepartmentForm').trigger("reset");
    hideAllDivs();
    $('#createNewDepartmentBox').show();

    // Populate Location select
    // Makes sure the locations select will only be populated once
    if ($('#selectDepartmentLocation option').length === 1) {
        $.ajax({
            url: 'libs/php/getAllLocations.php',
            type: 'POST',
            dataType: 'json',
            success: (results) => {
                const locations = results.data;
                locations.forEach(location => {
                    $('<option>', {
                        text: location.name,
                        value: location.id,
                    }).appendTo(selectDepartmentLocation);
                })
            }
    });
    }
});

const hideAllDivs = () => {
    $('.allDivs').hide();
};

// Submit createDepartment
$('#createNewDepartmentForm').submit((e) => {
    // Trims and capitalizes department name
    const departmentName = capitalize($('#newDepartmentName').val()).trim();
    const locationID = $('#selectDepartmentLocation').val();
    let dataIsOkay = true;

    if ($('#selectDepartmentLocation').val() === null) {
        alert('Please select a location.');
        dataIsOkay = false;
        e.preventDefault();
        return false;
    };

    // Ensures the department does not already exist
    departments.forEach(department => {
        if(departmentName === department.name) {
            alert('Department already exists.');
            dataIsOkay = false;
            e.preventDefault();
            return;
        }
    });

    if (dataIsOkay) {
        $.ajax({
            url: 'libs/php/insertDepartment.php',
            type: 'POST',
            dataType: 'json',
            data: {
                name: departmentName,
                locationID: locationID
            },
            success: () => {
                // Updates the departments array
                getAllDepartments();
            }
        });
    }

});

// Opens the create Location page
$('#createLocationButton').click(() => {
    // Clears the form whenever the user opens the page
    $('#createNewLocationForm').trigger("reset");
    hideAllDivs();
    $('#createNewLocationBox').show();
});

// Submit create location
$('#createNewLocationForm').submit((e) => {    
    // Trims and capitalizes location name
    const locationName = capitalize($('#newLocation').val()).trim();

    // Ensures the location does not already exist
    let dataIsOkay = true;
    locations.forEach(location => {
        if(locationName === location.name) {
            alert('Location already exists.');
            dataIsOkay = false;
            e.preventDefault();
        }
    });
    if (dataIsOkay) {
        $.ajax({
            url: 'libs/php/insertLocation.php',
            type: 'POST',
            dataType: 'json',
            data: {
                name: locationName
            },
            success: () => {
                // updates the locations array
                getAllLocations();
            }
        }); 
    }

});


// Brings user back to home page
$('#companyLogoButton').click(() => {
    hideAllDivs();
    $('#allEmployeesBox').show();  
}); 

$('#employeesButton').click(() => {
    hideAllDivs();
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
        alert('Please select a department.');
        return false;
    } else {
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
        })
    }
});

const employeeDetails = {
    firstName: '',
    lastName: '',
    department: '',
    email: '',
    location: '',
    employeeId: ''
};

const departmentDetails = {
    id: '',
    name: '',
    location: ''
};

// Select employee from table
$('#employeeTable').click((e) => {
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

// Edit employee button
$('#editEmployee').click(() => {
    $('#editDepartmentID').find('option').remove();
    $.ajax({
        url: 'libs/php/getAllDepartmentsWithLocationID.php',
        type: 'POST',
        dataType: 'json',
        success: (result) => {
            result.data.forEach(department => {
                console.log(department)
                if (employeeDetails.department === department.name) {
                    $('<option>', {
                        text: department.name,
                        value: department.id,
                        locationId: department.locationID,
                        selected: true
                    }).appendTo($('#editDepartmentID'));
                } else {
                    $('<option>', {
                        text: department.name,
                        value: department.id,
                        locationId: department.locationID
                }).appendTo($('#editDepartmentID'));
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
    const departmentID = $('#editDepartmentID').val();

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
        success: () => {
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
});

// End of edit employee functions

// Edit department Funtions 
const fetchAllDepartments = () => {
    $.ajax({
        url: 'libs/php/getAllDepartments.php',
        type: 'POST',
        dataType: 'json',
        success: (results) => {
            const departments = results.data;
            departments.forEach(department => {
                $('#departmentTableBody').append(
                    `<tr>
                        <td><a href="#" class="test" departmentId=${department.departmentId}>${department.departmentName}</a></td>
                        <td>${department.locationName}</td>
                    </tr>`
                )
            })
            $('#departmentsCount').html(departments.length);
            $('#departmentsLoader').css('display', 'none');
            $('#departmentsTable').css('display', 'block');
        }
    }); 
}

$('#editDepartmentsButton').click(() => {
    hideAllDivs();
    $('#allDepartmentsBox').show();
    // Ajax request to get all Departments
    if (firstLoad) {
        fetchAllDepartments();
        firstLoad = false;
    } else {
        return;
    }

});

// Handle department selection
$('#departmentsTable').click((e) => {
    $('#departmentDetailsLoaded').css('display', 'none');
    $('#departmentDetailsLoader').css('display', 'block');
    const departmentId = e.target.getAttribute('departmentId');
    if (departmentId !== null) {
        $('#allDepartmentsBox').hide();        
        $('#departmentInfoBox').show();
        $('#departmentDetails').show()
        $.ajax({
            url: 'libs/php/getDepartmentByID.php',
            type: 'POST',
            dataType: 'json',
            data: {
                id: departmentId
            },
            success: (results) => {
                const department = results.data[0];
                console.log(department)
                departmentDetails.name = department.departmentName;
                departmentDetails.id = department.departmentId;
                departmentDetails.location = department.locationName;
                console.log(departmentDetails.location)

                $('#departmentName').html(departmentDetails.name);
                $('#departmentID').html(departmentDetails.id);
                $('#departmentLocation').html(departmentDetails.location);

                $('#departmentDetailsLoader').css('display', 'none');
                $('#departmentDetailsLoaded').css('display', 'block');
            }
        });
    } 
});

// Handle edit department
$('#editDepartmentButton').click(() => {
    $.ajax({
        url: 'libs/php/getAllLocations.php',
        type: 'POST',
        dataType: 'json',
        success: (result) => {
            console.log(result);
            result.data.forEach(location => {
                console.log(location.name);
                if (departmentDetails.location === location.name) {
                    $('<option>', {
                        text: location.name,
                        value: location.id,
                        selected: true
                    }).appendTo($('#editDepartmentLocation'));
                } else {
                    $('<option>', {
                        text: location.name,
                        value: location.id,
                    }).appendTo($('#editDepartmentLocation'));
                }
    
            });
        }
    });

    $('#departmentDetails').hide();
    $('#editDepartmentForm').show();
    $('#editDepartmentName').val(departmentDetails.name);
});

// Edit Employee Functions
const updateDepartmentDetails = (departmentId) => {

    const name = capitalize($('#editDepartmentName').val()).trim();
    const locationID = $('#editDepartmentLocation').val();

    $.ajax({
        url: 'libs/php/updateDepartmentDetails.php',
        type: 'POST',
        dataType: 'json',
        data: {
            departmentName: name,
            locationID: locationID,
            departmentID: departmentId
        },
        success: () => {
            console.log('Department successfully updated')
            fetchAllDepartments();
        }
    });
};

$('#cancelEditDepartmentButton').click((e) => {
    e.preventDefault();
    $('#editDepartmentForm').hide();
    $('#departmentDetails').show();
});

$('#confirmEditDepartmentButton').click(() => {
    updateDepartmentDetails(departmentDetails.id);
});

// Handle delete department
const deleteDepartmentByID = (departmentId) => {
    $.ajax({
        url: 'libs/php/deleteDepartmentByID.php',
        type: 'POST',
        dataType: 'json',
        data: {
            id: departmentId
        },
        success: () => {
            console.log('Department Successfully deleted');
            fetchAllDepartments();
        }
    });
};

$('#confirmDeleteDepartment').click(() => {
    deleteDepartmentByID(departmentDetails.id);
});

$('#deleteDepartmentButton').click(() => {
    // Get all personnel by department to see if anyone is assigned
    const departmentID = departmentDetails.id;
    let employeeCount = 0;

    $.ajax({
        url: 'libs/php/getEmployeesByDepartment.php',
        type: 'POST',
        dataType: 'json',
        data: {
            departmentID: departmentID
        },
        success: (results) => {
            // Assign employee count the number of employees to check if empty
            employeeCount = results.data.personnel.length;
            if (employeeCount < 1) {  // If no employees, allow the user to delete the department
                $('#departmentNameToDelete').html(departmentDetails.name);
                $('#confirmDeleteDepartmentModal').modal('show');
            } else {  // If there are employees, alert the user that department cannot be deleted while there are employees assigned
                $('#departmentMustBeEmptyModal').modal("show");
            }
        }
    });
});


// Dropdown menu
$("#dropdown").hover(function(){
    $('#createDropdownList').toggle(200)
});

$('#editDropdown').hover(function() {
    $('#editDropdownList').toggle(200);
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

// filter department table search 
$(document).ready(function(){
    $("#searchDepartmentTable").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#departmentTableBody tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
});
