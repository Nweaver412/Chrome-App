document.getElementById('saveToken').addEventListener('click', () => {
  const token = document.getElementById('token').value;
  chrome.storage.sync.set({ githubToken: token }, () => {
    alert("Token saved!");
  });
});

document.getElementById('fetch').addEventListener('click', async () => {
  chrome.storage.sync.get('githubToken', async (items) => {
    const token = items.githubToken;
    if (!token) {
      alert("Please save your GitHub token first.");
      return;
    }

    const projectsList = document.getElementById('projects');
    projectsList.innerHTML = '';

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
    const sharedRepos = repos.filter(repo => 
      repo.owner.login !== username && 
      (repo.permissions.push || repo.permissions.pull)
    );

    const groupedRepos = sharedRepos.reduce((acc, repo) => {
      if (!acc[repo.owner.login]) {
        acc[repo.owner.login] = [];
      }
      acc[repo.owner.login].push(repo);
      return acc;
    }, {});

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
