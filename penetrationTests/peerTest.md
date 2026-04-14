# 1
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click                                                       |
| Classification | Broken Access Control                                                                      |
| Severity       | 1                                                                              |
| Description    | Register existing user with different email.                 |
| Images         | ![admin trying to access franchises](./images/attack1.png) <br/> can still log into past user, but admin priveleges may have been removed. |
| Corrections    | Check if user already exists before registering.                                                          |
# 2
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click                                                       |
| Classification | Broken Access Control                                                                     |
| Severity       | 0                                                                              |
| Description    | Order with previously logged out user.                 |
| Images         | ![logged out user req and resp](./images/attack2.png) <br/>. autentication missing.|
| Corrections    | None. Code works properly        |
# 3
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click                                                       |
| Classification | Broken Access Control                                                                      |
| Severity       | 3                                                                             |
| Description    | Altering the price of the order to $0, -$1000000000, $-1, and $100000000.                 |
| Images         | ![order -$1000000000 out user req and resp](./images/attack3b.png) <br/>. !![order -$1000000000 out user req and resp](./images/attack3b.png) <br/>.
 ![order -$1 out user req and resp](./images/attack3c.png) <br/>. ![order $100000000 out user req and resp](./images/attack3d.png) <br/>. could order for 0 and negative 1, but the larger values were out of range.
| Corrections    | double check that price matches database item order price. Don't allow negative numbers or 0.      |
# 4
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click                                                       |
| Classification | Broken Access Control                                                                      |
| Severity       | 3                                                                           |
| Description    | change order to non-existent store.                 |
| Images         | ![order store 1000 user req and resp](./images/attack4.png) <br/>. placed an order with non-existing store|
| Corrections    | check that store exists before ordering   |

# 5
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click                                                       |
| Classification | Broken Access Control                                                                     |
| Severity       | 3                                                                            |
| Description    | change order to non-existent franchise.                 |
| Images         | ![order franchise 44 user req and resp](./images/attack5.png) <br/>.  placed an order with non-existing franchise |
| Corrections    | check that franchize exists before ordering   |

# 6
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click                                                       |
| Classification | injection                                                                    |
| Severity       | 0                                                                            |
| Description    | SQL injection through user login to try to delete database users. User's were protected                 |
| Images         | ![attempt 1 user req and resp](./images/attack6.png) <br/>. |
| Images         | ![attempt 2 user req and resp](./images/attack6b.png) <br/>. |
| Images         | ![attempt 3 user req and resp](./images/attack6c.png) <br/>. User delete attempts.|
| Images         | ![regular login after attempted user delete req and resp](./images/attack6d.png) <br/>. User delete attempts did not work. Can still log in previous user.|
| Corrections    | None. code is properly protecting against SQL injections   |
