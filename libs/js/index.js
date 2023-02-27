// Get all employees from the Databased-sm
const fetchAllEmployees = () => {
    $.ajax({
        url: 'libs/php/getAll.php',
        type: 'POST',
        dataType: 'json',
        success: (result) => {
            // Assigns each employee a row on the table
            const employees = result.data;
            $('#tableBody').html('');
            employees.forEach(employee => {
                const fullname = `${employee.firstName} ${employee.lastName}`;
                $('#tableBody').append(
                    `<tr>
                        <td><a href="#" class="test" userid=${employee.employeeId}>${fullname}</a></td>
                        <td class='d-none d-sm-none d-lg-table-cell'>${employee.location}</td>
                        <td>${employee.jobTitle}</td>
                        <td>${employee.department}</td>
                        <td class="d-none d-sm-none d-lg-table-cell">${employee.email}</td>
                        <td><i class="fa-solid fa-pen editUser" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id=${employee.employeeId} data-fullName="${employee.firstName} ${employee.lastName}"></i> <i class="fa-solid fa-trash deleteUser" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id=${employee.employeeId} data-fullName="${employee.firstName} ${employee.lastName}"></i></td>
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
    $('#createNewEmployeeModal').modal('show');
    $.ajax({
        url: 'libs/php/getAllDepartments.php',
        type: 'POST',
        dataType: 'json',
        success: (results) => {
            const departments = results.data;
            console.log(departments)
            departments.forEach(department => {
                $('<option>', {
                    text: department.departmentName,
                    value: department.departmentId,
                }).appendTo(selectEmployeeDepartment);
            });
        }
    });
});

// Submit form button
$('#createNewEmployeeForm').submit(() => {
    // Clean up and capitalize form data
    const firstName = capitalize($('#newEmployeeFirstName').val()).trim();
    const lastName = capitalize($('#newEmployeeLastName').val()).trim();
    const email = $('#newEmployeeEmail').val().trim();
    const jobTitle = capitalize($('#newEmployeeJobTitle').val()).trim();
    const departmentID = $('#selectEmployeeDepartment').val();

    // Checks if a department has been selected 
    if ($('#selectEmployeeDepartment').val() === null) {
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
                departmentID: departmentID,
                jobTitle: jobTitle
            },
            success: () => {
                fetchAllEmployees();
                $('#createNewEmployeeModal').modal('hide');
            }
        })
    }
});

// Opens the create Department page
$('#createDepartmentButton').click(() => {
    // Clears the form whenever the user opens the page
    $('#createNewDepartmentForm').trigger("reset");
    $('#createNewDepartmentModal').modal('show');
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
                });
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
                fetchAllDepartments();
                $('#createNewDepartmentModal').modal('hide');
            }
        });
    }

});

// Opens the create Location page
$('#createLocationButton').click(() => {
    // Clears the form whenever the user opens the page
    $('#createNewLocationForm').trigger("reset");
    $('#createNewLocationModal').modal('show');
});

// Submit create location
$('#createNewLocationForm').submit((e) => {    
    // Trims and capitalizes location name
    const locationName = capitalize($('#newLocationName').val()).trim();

    // Ensures the location does not already exist
    let dataIsOkay = true;
    $.ajax({
        url: 'libs/php/getAllLocations.php',
        type: 'POST',
        dataType: 'json',
        data: {
        },
        success: (results) => {
            const locations = results.data;    
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
                    fetchAllLocations();
                    $('#createNewLocationModal').modal('hide');
            }
        }); 
    }
        }
    }); 



});


// Brings user back to home page
$('#companyLogoButton').click(() => {
    hideAllDivs();
    $('#allEmployeesBox').show();  
}); 

$('#employeesButton').click(() => {
    hideAllDivs();
    fetchAllEmployees();
    $('#allEmployeesBox').show();
}); 

const employeeDetails = {
    firstName: '',
    lastName: '',
    department: '',
    email: '',
    jobTitle: '',
    location: '',
    employeeId: ''
};

// Delete Employee Functions
$('#deletePersonnelModal').on('show.bs.modal', (e) => {
    $('#confirmDeleteModal').modal("show");
    $('#employeeNameToDelete').html($(e.relatedTarget).attr('data-fullName'));
    console.log($(e.relatedTarget).attr('data-id'))
    $('#employeeIDToDelete').val($(e.relatedTarget).attr('data-id'));
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
    deleteEmployeeByID($('#employeeIDToDelete').val());
});
// End Delete Employee Functions

// Edit Employee Functions
const updateEmployeeDetails = (employeeId) => {
    const firstName = capitalize($('#editFirstName').val()).trim();
    const lastName = capitalize($('#editLastName').val()).trim();
    const email = $('#editEmailAddress').val().trim();
    const departmentID = $('#editDepartment').val();
    const jobTitle = capitalize($('#editJobTitle').val()).trim()

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
            jobTitle: jobTitle
        },
        success: () => {
            console.log('Employee successfully updated');
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
            $('#departmentTableBody').html('');
            departments.forEach(department => {
                console.log(department.departmentName)
                $('#departmentTableBody').append(
                    `<tr>
                        <td><a href="#" class="test" departmentId=${department.departmentId}>${department.departmentName}</a></td>
                        <td>${department.locationName}</td>
                        <td><i class="fa-solid fa-pen editDepartment" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id=${department.departmentId} data-department="${department.departmentName}" data-location="${department.locationName}"></i> <i class="fa-solid fa-trash deleteDepartment" data-id=${department.departmentId} data-department="${department.departmentName}" data-bs-modal="#removeDepartmentModal" data-location="${department.locationName}"></i></td>
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

$('#editDepartmentModal').on('show.bs.modal', (e) => {
    $('#editDepartmentLocation').find('option').remove();

    $.ajax({
        url: 'libs/php/getAllLocations.php',
        type: 'POST',
        dataType: 'json',
        success: (result) => {
            const departmentToChange = $(e.relatedTarget).attr('data-id');
            const currentDepartmentName = $(e.relatedTarget).attr('data-department');
            const currentLocation = $(e.relatedTarget).attr('data-location');

            result.data.forEach(location => {
                if (currentLocation === location.name) {
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
            $('#editDepartmentName').val(currentDepartmentName);
            $('#departmentIDToEdit').val(departmentToChange);
        }
    });
});

$('#editDepartmentModal').on('shown.bs.modal', () => {
    $('#editDepartmentName').focus();
})

$('#editDepartmentForm').on("submit", function(e) {
    e.preventDefault(); 
    updateDepartmentDetails($('#departmentIDToEdit').val());
    $('#editDepartmentModal').modal("hide");
    fetchAllDepartments();        
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
$('#departmentTableBody').on('click', '.deleteDepartment', (e) => {
    const departmentObj = JSON.parse(JSON.stringify(e.target.dataset));
    const departmentID = departmentObj.id;
    $('.departmentIDToDelete').val(departmentID);
    $.ajax({
                url: 'libs/php/isDepartmentEmpty.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    departmentID: departmentID
                },
                success: (results) => {
                    if (results.data[0].departmentCount < 1) {
                        $('#departmentNameToRemove').html(departmentObj.department);
                        $('#confirmDeleteDepartmentModal').modal('show'); 
                    } else {
                        $('#departmentNameToDelete').html(departmentObj.department);
                        $('#employeeCountOnDept').html(results.data[0].departmentCount);
                        $('#departmentMustBeEmptyModal').modal('show');
                        console.log($('.departmentIDToDelete').val());
                    }
                    
                }
    });
});

$('#confirmDeleteDepartmentForm').click((e) => {
    e.preventDefault();
    deleteDepartmentByID($('.departmentIDToDelete').val());
})

const fetchAllLocations = () => {
    $.ajax({
        url: 'libs/php/getAllLocations.php',
        type: 'POST',
        dataType: 'json',
        success: (results) => {
            const locations = results.data;
            $('#locationTableBody').html('')
            locations.forEach(location => {
                $('#locationTableBody').append(
                    `<tr>                      
                        <td><a href="#" class="test" locationId=${location.id}>${location.name}</a></td>   
                        <td><i class="fa-solid fa-pen editLocation" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id=${location.id} data-name="${location.name}"></i> <i class="fa-solid fa-trash deleteLocation" data-id=${location.id} data-location="${location.name}"></i></td>
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
    console.log('works')
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

$('#editLocationModal').on('show.bs.modal', (e) => {
    $.ajax({
        url: 'libs/php/getLocationByID.php',
        type: 'POST',
        dataType: 'json',
        data: {
            id: $(e.relatedTarget).attr('data-id')
        },
        success: (results) => {
            $('#locationIDToEdit').val(results.data[0].locationId);
            $('#editLocationName').val(results.data[0].locationName);
        }
    });
});

$('#editLocationModal').on('shown.bs.modal', () => {
    $('#editLocationName').focus()
});

$('#editLocationForm').on("submit", (e) => {
    e.preventDefault(); 
    updateLocationDetails($('#locationIDToEdit').val());
    $('#editLocationModal').modal("hide");
    fetchAllLocations();        
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

$('#locationTableBody').on('click', '.deleteLocation', (e) => {
    const locationObj = JSON.parse(JSON.stringify(e.target.dataset));
    const locationID = locationObj.id;
    $('.locationIDToDelete').val(locationID);
    $.ajax({
                url: 'libs/php/isLocationEmpty.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    locationID: locationID
                },
                success: (results) => {
                    console.log(results);
                    if (results.data[0].departmentCount < 1) {
                        $('#locationNameToRemove').html(locationObj.location);
                        $('#confirmDeleteLocationModal').modal('show'); 
                    } else {
                        $('#locationNameToDelete').html(locationObj.location);
                        $('#locationCountOnDept').html(results.data[0].departmentCount);
                        $('#locationMustBeEmptyModal').modal('show');
                        console.log($('.locationIDToDelete').val());
                    }
                    
                }
    });
});

$('#confirmDeleteLocationForm').submit((e) => {
    e.preventDefault();
    deleteLocationByID($('.locationIDToDelete').val());
})

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
                        <td class="d-none d-sm-none d-lg-table-cell">${employee.location}</td>
                        <td>${employee.jobTitle}</td>
                        <td>${employee.department}</td>
                        <td class="d-none d-sm-none d-lg-table-cell">${employee.email}</td>
                        <td><i class="fa-solid fa-pen editUser" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id=${employee.employeeId} data-fullName="${employee.firstName} ${employee.lastName}"></i> <i class="fa-solid fa-trash deleteUser" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id=${employee.employeeId} data-fullName="${employee.firstName} ${employee.lastName}"></i></td>
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


$('#editEmployeeForm').on("submit", function(e) {
    e.preventDefault(); 
    updateEmployeeDetails(employeeDetails.id);
    $('#editPersonnelModal').modal("hide");
    fetchAllEmployees();        
});
  
$('#editPersonnelModal').on('show.bs.modal', function (e) {
    $.ajax({
    url: "./libs/php/getPersonnelByID.php",
    type: 'POST',
    dataType: 'json',
    data: {
      id: $(e.relatedTarget).attr('data-id') // Retrieves the data-id attribute from the calling button
    },
    success: function (result) {
        console.log(result)
      const resultCode = result.status.code
      if (resultCode == 200) {
        // Update the hidden input with the employee id so that
        // it can be referenced when the form is submitted
        employeeDetails.id = result.data.personnel[0].id;
        employeeDetails.firstName = result.data.personnel[0].firstName;
        employeeDetails.lastName = result.data.personnel[0].lastName;
        employeeDetails.jobTitle = result.data.personnel[0].jobTitle;
        employeeDetails.emailAdress = result.data.personnel[0].emailAdress;
        employeeDetails.department = result.data.personnel[0].departmentID;

        $('#employeeID').val(result.data.personnel[0].id);
        $('#editFirstName').val(result.data.personnel[0].firstName);
        $('#editLastName').val(result.data.personnel[0].lastName);
        $('#editJobTitle').val(result.data.personnel[0].jobTitle);
        $('#editEmailAddress').val(result.data.personnel[0].email);
        $('#editDepartment').html("");

        result.data.department.forEach(department => {
            if (employeeDetails.department == department.id) {
                $('<option>', {
                    text: department.name,
                    value: department.id,
                    selected: true
                }).appendTo($('#editDepartment'));
            } else {
                $('<option>', {
                    text: department.name,
                    value: department.id,
            }).appendTo($('#editDepartment'));
            }

        });
      } else {
        $('#exampleModal .modal-title').replaceWith("Error retrieving data");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('#exampleModal .modal-title').replaceWith("Error retrieving data");
    }
  });
});

$('#editPersonnelModal').on('shown.bs.modal', function () {
  $('#editFirstName').focus();   
});
