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
                        <td>${fullname}</td>
                        <td>${employee.location}</td>
                        <td>${employee.department}</td>
                    </tr>`
                )
            })
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
    $('#createNewUserBox').show();
});

// Brings user back to home page
$('#companyLogoButton').click(() => {
    $('#createNewUserBox').hide();
    $('#allEmployeesBox').show();
}); 

// Submit form button
$('#createNewUserForm').submit((e) => {
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

// Filter table search
$(document).ready(function(){
    $("#searchTable").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#tableBody tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  });