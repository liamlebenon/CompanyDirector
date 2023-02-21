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
let firstLocationsLoad = true;

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
    return string.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
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
        $('#selectLocationModal').modal('show');
        dataIsOkay = false;
        e.preventDefault();
        return false;
    };

    // Ensures the department does not already exist
    departments.forEach(department => {
        if(departmentName == department.departmentName) {
            $('#departmentExistsModal').modal('show');
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
            $('#locationExistsModal').modal("show");
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
        $('#userDepartmentIsEmptyModal').modal('show');
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

const locationDetails = {
    id: '',
    name: '',
    departments: []
}

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
                departmentDetails.name = department.departmentName;
                departmentDetails.id = department.departmentId;
                departmentDetails.location = department.locationName;

                $('#departmentName').html(departmentDetails.name);
                $('#departmentLocation').html(departmentDetails.location);

                $('#departmentDetailsLoader').css('display', 'none');
                $('#departmentDetailsLoaded').css('display', 'block');
            }
        });
    } 
});

// Handle edit department
$('#editDepartmentButton').click(() => {
    $('#editDepartmentLocation').find('option').remove();
    $.ajax({
        url: 'libs/php/getAllLocations.php',
        type: 'POST',
        dataType: 'json',
        success: (result) => {
            result.data.forEach(location => {
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
// Will be called when the editDepartmentsForm is submitted
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

// Will cancel the edit
$('#cancelEditDepartmentButton').click((e) => {
    e.preventDefault();
    $('#editDepartmentForm').hide();
    $('#departmentDetails').show();
});

// Will confirm and submit the edit
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

// Will delete the department
$('#confirmDeleteDepartment').click(() => {
    deleteDepartmentByID(departmentDetails.id);
});

$('#deleteDepartmentButton').click(() => {
    // Get all personnel by department to see if anyone is assigned
    const departmentID = departmentDetails.id;

    $.ajax({
        url: 'libs/php/isDepartmentEmpty.php',
        type: 'POST',
        dataType: 'json',
        data: {
            departmentID: departmentID
        },
        success: (results) => {
            const personnelCount = results.data[0].numberOfPersonnel;
            // Assign employee count the number of employees to check if empty
            if (personnelCount < 1) {  // If no employees, allow the user to delete the department
                $('#departmentNameToDelete').html(departmentDetails.name);
                $('#confirmDeleteDepartmentModal').modal('show');
            } else {  // If there are employees, alert the user that department cannot be deleted while there are employees assigned
                $('#departmentMustBeEmptyModal').modal("show");
            }
        }
    });
});

// start edit and view locations

const fetchAllLocations = () => {
    $.ajax({
        url: 'libs/php/getAllLocations.php',
        type: 'POST',
        dataType: 'json',
        success: (results) => {
            const locations = results.data;
            locations.forEach(location => {
                $('#locationTableBody').append(
                    `<tr>                      
                        <td><a href="#" class="test" locationId=${location.id}>${location.name}</a></td>   
                    </tr>`
                )
            })
            $('#locationsCount').html(locations.length);
            $('#locationsLoader').css('display', 'none');
            $('#locationsTable').css('display', 'block');
        }
    }); 
}

$('#editLocationsButton').click(() => {
    hideAllDivs();
    $('#allLocationsBox').show();
    // Ajax request to get all locations
    if (firstLocationsLoad) {
        fetchAllLocations();
        firstLocationsLoad = false;
    } else {
        return;
    }
});

// Select Individual location
$('#locationsTable').click((e) => {
    $('#locationsDetailsLoaded').css('display', 'none');
    $('#locationsDetailsLoader').css('display', 'block');
    const locationId = e.target.getAttribute('locationId');
    if (locationId !== null) {
        $('#allLocationsBox').hide();        
        $('#locationInfoBox').show();
        $('#locationDetails').show()
        $.ajax({
            url: 'libs/php/getLocationByID.php',
            type: 'POST',
            dataType: 'json',
            data: {
                id: locationId
            },
            success: (results) => {
                
                $('#locationDetailsTableBody').html('');
                const locations = results.data;

                locationDetails.name = locations[0].locationName;
                locationDetails.id = locations[0].locationId; 

                if (locations[0].departmentName === null) {
                    $('#locationDetailsTableBody').append(
                        `<tr>                        
                            <td>No departments assigned to this location.</td>   
                        </tr>`
                    );
                    $('#locationDetailsTable').show();
                    $('#locationDepartmentsCount').html('0') 
                } else {
                    locations.forEach(location => {
                        $('#locationDetailsTableBody').append(
                            `<tr>                        
                                <td><a href="#" class="test" departmentId=${location.departmentId}>${location.departmentName}</a></td>   
                            </tr>`
                        )
                        locationDetails.departments.push(location.departmentName);
                    });
                    $('#locationDetailsTable').show();
                    $('#locationDepartmentsCount').html(locations.length)    
                }                    
                $('#locationName').html(locationDetails.name);
                $('#locationID').html(locationDetails.id);
                $('#locationDetailsLoader').css('display', 'none');
                $('#locationDetailsLoaded').css('display', 'block');
                
            }
        });
    } 
});

const updateLocationDetails = (locationId) => {

    const name = capitalize($('#editLocationName').val()).trim();
    $.ajax({
        url: 'libs/php/updateLocationDetails.php',
        type: 'POST',
        dataType: 'json',
        data: {
            locationName: name,
            id: locationId
        },
        success: () => {
            console.log('Location successfully updated')
            fetchAllLocations();
        }
    });
};

$('#editLocationButton').click(() => {
    $('#locationDetails').hide();
    $('#editLocationForm').show();
    $('#editLocationName').val(locationDetails.name);
});

// Will cancel the edit
$('#cancelLocationButton').click((e) => {
    e.preventDefault();
    $('#editLocationForm').hide();
    $('#locationDetails').show();
});

// Will confirm and submit the edit
$('#confirmLocationButton').click(() => {
    updateLocationDetails(locationDetails.id);
});

// Handle delete location
const deleteLocationByID = (locationId) => {
    $.ajax({
        url: 'libs/php/deleteLocationByID.php',
        type: 'POST',
        dataType: 'json',
        data: {
            id: locationId
        },
        success: () => {
            console.log('Location Successfully deleted');
            fetchAllLocations();
        }
    });
};

$('#deleteLocationButton').click(() => {
    // Get all personnel by department to see if anyone is assigned
    const locationID = locationDetails.id;

    $.ajax({
        url: 'libs/php/isLocationEmpty.php',
        type: 'POST',
        dataType: 'json',
        data: {
            locationID: locationID
        },
        success: (results) => {
            console.log(results)
            const departmentCount = results.data[0].numberOfDepartments;
            // Assign departments count the number of departments to check if empty
            if (departmentCount < 1) {  // If no employees, allow the user to delete the department
                $('#locationNameToDelete').html(locationDetails.name);
                $('#confirmDeleteLocationModal').modal('show');
            } else {  // If there are departments, alert the user that location cannot be deleted while there are departments assigned
                $('#locationMustBeEmptyModal').modal("show");
            }
        }
    });
});

// confirm delete button
$('#confirmDeleteLocation').click(() => {
    deleteLocationByID(locationDetails.id);
});



// Dropdown menu
$("#dropdown").hover(function(){
    $('#createDropdownList').toggle(200)
});

$('#editDropdown').hover(function() {
    $('#editDropdownList').toggle(200);
});

const filterTable = (searchWord) => {
    $.ajax({
        url: 'libs/php/searchTable.php',
        type: 'POST',
        dataType: 'json',
        data: {
            term: searchWord
        },
        success: (results) => {                
            $('#tableBody').html('');
            const employees = results.data;
            employees.forEach(employee => {
                console.log(employee)
                const fullname = `${employee.firstName} ${employee.lastName}`;
                $('#tableBody').prepend(
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

// Filter table search
$(document).ready(function(){
    $("#searchTable").on("keyup", function() {
        let value = $(this).val().toLowerCase();
        filterTable(value);
    });    
});

