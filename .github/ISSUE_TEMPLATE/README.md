# GitHub Issue Templates for UAT Testing

This directory contains standardized GitHub issue templates designed for comprehensive User Acceptance Testing (UAT) workflows. These templates ensure consistent, detailed issue reporting across different types of findings.

## Available Templates

### 1. **bug_report.yml** - Functional Defects
- **Purpose**: Report bugs and functional issues found during UAT testing
- **Labels**: `bug`, `uat`, `needs-triage`
- **Key Features**: 
  - Business impact assessment
  - Detailed reproduction steps
  - Environment and user role context
  - UAT testing checklist validation

### 2. **accessibility_issue.yml** - Accessibility Barriers
- **Purpose**: Report WCAG compliance violations and accessibility barriers
- **Labels**: `accessibility`, `uat`, `wcag`, `needs-triage`
- **Key Features**:
  - WCAG 2.2 guideline mapping
  - User impact categorization (screen readers, keyboard users, etc.)
  - Assistive technology testing details
  - Suggested remediation approaches

### 3. **performance_issue.yml** - Performance Problems
- **Purpose**: Report performance issues affecting user experience
- **Labels**: `performance`, `uat`, `needs-triage`
- **Key Features**:
  - Performance metric tracking (LCP, FID, CLS)
  - Target vs. actual performance values
  - User impact severity assessment
  - Performance testing tool integration

### 4. **security_issue.yml** - Security Concerns
- **Purpose**: Report security vulnerabilities from user perspective
- **Labels**: `security`, `uat`, `needs-triage`
- **Key Features**:
  - OWASP Top 10 categorization
  - Risk level assessment
  - Compliance impact tracking (GDPR, HIPAA, etc.)
  - Responsible disclosure acknowledgment

### 5. **usability_issue.yml** - User Experience Problems
- **Purpose**: Report UX friction and usability barriers
- **Labels**: `usability`, `ux`, `uat`, `needs-triage`
- **Key Features**:
  - Nielsen usability heuristics mapping
  - User journey context
  - Business impact assessment
  - User research method documentation

## Installation Instructions

### Option 1: Copy to Specific Project
Copy the desired templates to your project's `.github/ISSUE_TEMPLATE/` directory:

```bash
# Navigate to your project
cd /path/to/your/project

# Create the issue template directory
mkdir -p .github/ISSUE_TEMPLATE

# Copy the templates you need
cp ~/source/github_templates/issues/*.yml .github/ISSUE_TEMPLATE/
```

### Option 2: Symbolic Links (for multiple projects)
Create symbolic links to maintain a single source of truth:

```bash
# In your project directory
cd /path/to/your/project/.github/ISSUE_TEMPLATE

# Create symbolic links
ln -s ~/source/github_templates/issues/bug_report.yml ./
ln -s ~/source/github_templates/issues/accessibility_issue.yml ./
ln -s ~/source/github_templates/issues/performance_issue.yml ./
ln -s ~/source/github_templates/issues/security_issue.yml ./
ln -s ~/source/github_templates/issues/usability_issue.yml ./
```

### Option 3: Organization-wide Templates
For GitHub organizations, place templates in a `.github` repository at the organization level.

## Usage Guidelines

### When to Use Each Template

- **Bug Report**: Any functional failure, incorrect behavior, or system error
- **Accessibility Issue**: WCAG violations, screen reader problems, keyboard navigation issues
- **Performance Issue**: Slow load times, poor Core Web Vitals, response time problems
- **Security Issue**: Authentication bypasses, data exposure, authorization failures
- **Usability Issue**: User confusion, task completion difficulties, UX friction

### Label Strategy

Each template includes default labels, but teams should customize based on their workflow:

- **Type Labels**: `bug`, `accessibility`, `performance`, `security`, `usability`
- **Priority Labels**: `critical`, `high`, `medium`, `low`
- **Component Labels**: `frontend`, `backend`, `api`, `database`, `auth`
- **Process Labels**: `uat`, `needs-triage`, `in-review`, `ready-for-dev`

### Severity Guidelines

#### Critical Issues
- Complete feature failures
- Security vulnerabilities with data exposure
- Accessibility barriers preventing screen reader access
- Performance issues >5s affecting core workflows

#### High Issues  
- Major functionality impacted
- WCAG AA violations on primary user journeys
- Performance issues 3-5s affecting user experience
- Security risks with potential data access

#### Medium Issues
- Minor issues with workarounds available
- WCAG violations on secondary features
- Performance issues 2-3s with acceptable alternatives
- Usability improvements for better experience

#### Low Issues
- Cosmetic issues
- Enhancement requests
- Minor performance optimizations
- Code quality improvements

## Template Customization

### Adding Custom Fields
Each template can be customized by:
1. Adding new dropdown options
2. Including project-specific validation requirements
3. Modifying required/optional fields
4. Adding custom checkboxes for project workflows

### Example Customization
```yaml
  - type: dropdown
    id: component
    attributes:
      label: Component
      options:
        - Frontend - React Components
        - Backend - API Services  
        - Database - Queries/Schema
        - Infrastructure - Deployment/Config
        - Third-party - External Integration
```

### Environment-Specific Fields
For different environments, add conditional fields:
```yaml
  - type: input
    id: build_version
    attributes:
      label: Build Version
      description: Specific build or commit hash being tested
      placeholder: ex. v2.1.4-rc.1 or commit abc123
```

## Integration with UAT Workflows

### Automated Issue Creation
These templates support automated issue creation through:
- GitHub API integration
- Webhook triggers from testing tools
- CI/CD pipeline integration
- Custom UAT testing dashboards

### Metrics and Reporting
Track UAT effectiveness using issue labels:
```bash
# Count issues by type
gh issue list --label "uat" --state all --json labels

# Track resolution times
gh issue list --label "uat" --state closed --json closedAt,createdAt

# Monitor critical issues
gh issue list --label "critical" --label "uat" --state open
```

### Team Workflows
1. **Triage**: Weekly review of `needs-triage` issues
2. **Prioritization**: Assign based on severity and business impact
3. **Assignment**: Route to appropriate team based on component labels
4. **Validation**: Use UAT testing checklists for verification
5. **Closure**: Confirm fix with original UAT testing approach

## Best Practices

### For UAT Testers
- Include screenshots/videos for visual issues
- Test reproduction steps before submitting
- Provide business context and user impact
- Use consistent terminology across issues

### For Development Teams
- Review UAT checklists during development
- Tag issues with appropriate components
- Provide estimated effort for triage
- Include test scenarios in pull requests

### For Product Teams
- Use business impact fields for prioritization
- Cross-reference user stories and acceptance criteria
- Track issue patterns for process improvement
- Monitor resolution times for planning

## Maintenance

### Regular Updates
- Review templates quarterly for relevance
- Update based on team feedback
- Align with evolving testing standards (WCAG updates, new OWASP guidelines)
- Incorporate lessons learned from previous cycles

### Version Control
- Keep templates in version control
- Document changes in commit messages
- Tag releases for template versions
- Communicate updates to all teams using templates

---

**Note**: These templates are designed to work with the UAT Testing Expert agent from the SuperClaude Framework, enabling comprehensive and consistent UAT issue tracking across projects.