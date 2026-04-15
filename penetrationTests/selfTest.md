# 1
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click/register                                                       |
| Classification | Broken Access Control                                                                      |
| Severity       | 2                                                                             |
| Description    | Attempted to re-register an existing user account to overwrite credentials/privileges                 |
| Images         | ![admin trying to access franchises](./images/attack1.png) <br/> can still log into past user, but admin priveleges may have been removed. |
| Corrections    | Check if user already exists before registering.                                                          |
# 2
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click/api/order   POST                                                       |
| Classification | Broken Access Control                                                                     |
| Severity       | 0                                                                              |
| Description    | Order with previously logged out user. User unauthorized |
| Images         | ![logged out user req and resp](./images/attack2.png) <br/>. autentication missing.|
| Corrections    | None. Code works properly        |
# 3
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click/api/order   POST                                                       |
| Classification | Broken Access Control                                                                      |
| Severity       | 2                                                                            |
| Description    | Altering the price of the order to $0, -$1000000000, $-1, and $100000000. Could order for 0 and -1, but the larger values were out of range.              |
| Images         | ![order -$1000000000 out user req and resp](./images/attack3b.png) <br/>. ![order -$1000000000 out user req and resp](./images/attack3b.png) <br/>.
 ![order -$1 out user req and resp](./images/attack3c.png) <br/>. ![order $100000000 out user req and resp](./images/attack3d.png) <br/>. could order for 0 and negative 1, but the larger values were out of range. |
| Corrections    | double check that price matches database item order price. Don't allow negative numbers or 0.      |
# 4
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click/api/order   POST                                                       |
| Classification | Broken Access Control                                                                      |
| Severity       | 2                                                                           |
| Description    | change order to non-existent store. was able to order with a non-existing store. order successfully placed                |
| Images         | ![order store 1000 user req and resp](./images/attack4.png) <br/>. placed an order with non-existing store|
| Corrections    | check that store exists before ordering   |

# 5
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click/api/order   POST                                                       |
| Classification | Broken Access Control                                                                     |
| Severity       | 2                                                                            |
| Description    | change order to non-existent franchise. order successfully placed               |
| Images         | ![order franchise 44 user req and resp](./images/attack5.png) <br/>.  placed an order with non-existing franchise |
| Corrections    | check that franchise exists before ordering   |

# 6
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click/api/auth PUT       |
| Classification | injection                                                                    |
| Severity       | 0                                                                            |
| Description    | SQL injection through user login to try to delete database users. SQL injection failed. User's were protected |
| Images         | ![attempt 1 user req and resp](./images/attack6.png) <br/>.  ![attempt 2 user req and resp](./images/attack6b.png) <br/>. = ![attempt 3 user req and resp](./images/attack6c.png) <br/>. User delete attempts. <br/>.  ![regular login after attempted user delete req and resp](./images/attack6d.png) <br/>. User delete attempts did not work. Can still log in previous user.|
| Corrections    | None. code is properly protecting against SQL injections   |
