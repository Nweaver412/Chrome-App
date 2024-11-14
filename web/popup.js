// Event listener to save the GitHub token securely
document.getElementById('saveToken').addEventListener('click', () => {
  const token = document.getElementById('token').value;
  chrome.storage.sync.set({ githubToken: token }, () => {
    alert("Token saved!");
  });
});

// Event listener to fetch shared projects
document.getElementById('fetch').addEventListener('click', async () => {
  chrome.storage.sync.get('githubToken', async (items) => {
    const token = items.githubToken;
    if (!token) {
      alert("Please save your GitHub token first.");
      return;
    }

    const projectsList = document.getElementById('projects');
    projectsList.innerHTML = ''; // Clear the project list

    // Fetch authenticated user's information
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`
      }
    });

    if (!userResponse.ok) {
      alert("Error fetching user information.");
      return;
    }

    const user = await userResponse.json();
    const username = user.login;

    // Fetch repositories with collaborator access
    const reposResponse = await fetch('https://api.github.com/user/repos?affiliation=collaborator', {
      headers: {
        'Authorization': `token ${token}`
      }
    });

    if (!reposResponse.ok) {
      alert("Error fetching projects.");
      return;
    }

    const repos = await reposResponse.json();
    // Filter for repositories where the user is a collaborator but not the owner, and are public or shared repos
    const sharedRepos = repos.filter(repo => 
      repo.owner.login !== username && 
      (repo.permissions.push || repo.permissions.pull)
    );

    // Group repositories by owner
    const groupedRepos = sharedRepos.reduce((acc, repo) => {
      if (!acc[repo.owner.login]) {
        acc[repo.owner.login] = [];
      }
      acc[repo.owner.login].push(repo);
      return acc;
    }, {});

    // Display grouped repositories
    Object.keys(groupedRepos).forEach(owner => {
      const ownerHeading = document.createElement('h3');
      ownerHeading.textContent = owner;
      projectsList.appendChild(ownerHeading);

      const ownerList = document.createElement('ul');
      groupedRepos[owner].forEach(repo => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = repo.html_url;
        link.target = "_blank";
        link.textContent = repo.name;
        li.appendChild(link);
        ownerList.appendChild(li);
      });

      projectsList.appendChild(ownerList);
    });
  });
});
