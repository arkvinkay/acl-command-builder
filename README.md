# ACL Command Builder

ACL Command Builder is a static web-based learning and support utility that helps generate Linux and Windows ACL 
commands through a guided interface.

I built this site as a practical companion for real CLI work: if I need to handle ACLs in the future,
I can use this command builder to quickly produce correct commands and reduce mistakes under time
pressure.

---

## Why This Exists (Learning + IT Support)

Linux and Windows file permissions and ACLs can be error-prone when typed manually, especially when you need to:
- apply permissions for specific users/groups
- update existing ACL entries without breaking current rules

This tool is intended to:
- speed up command generation during troubleshooting
- reinforce understanding of ACL syntax and flags
- serve as a quick reference when handling permission-related tickets or tasks

---

## Features

- Generate `setfacl` commands from selected ACL options
- Generate/assist `getfacl` usage for verification
- Copy-ready command output for terminal usage
- Fully static frontend (no backend dependency)
- Included manual for usage and concepts

---

## Workflow (How I Use It)

1. Identify the permission requirement (user/group/others, access vs default ACL, recursive needs)
2. Use the builder to generate the command
3. Run the command in CLI
4. Verify results 

---

## Documentation

A usage manual is included in the `manual/` directory.  
Documentation was generated with AI assistance and reviewed through hands-on usage to ensure accuracy
and clarity.

---

## Validation & Scope

- Fully client-side (HTML, CSS, JavaScript)
- No data is sent to external services
- Outputs and interactions were validated through manual functional testing

The source code was generated with AI assistance.  
I can read and understand parts of the code, but I do not maintain or extend it without AI support.

This repository is intended as a learning/support utility and documentation artifact, not as a
demonstration of custom frontend engineering skills.

---

## Intended Use Cases

- Practicing and learning ACL syntax
- IT Support / Helpdesk troubleshooting involving permission issues
- Faster, safer command generation for repeatable ACL tasks
- Personal reference during CLI-based system administration work

---

## License

This project is licensed under the MIT License.  
No warranty is provided.
